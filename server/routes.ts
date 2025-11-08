import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { githubSearchSchema, personalScriptSchema, type GitHubSearchResult } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Using Replit AI Integrations for OpenAI - no API key needed, billed to Replit credits
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

async function searchGitHubForAHKScripts(query: string, page: number = 1, perPage: number = 30): Promise<{ results: GitHubSearchResult[], totalCount: number }> {
  const encodedQuery = encodeURIComponent(`${query} extension:ahk`);
  const url = `https://api.github.com/search/code?q=${encodedQuery}&page=${page}&per_page=${perPage}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AHK-Script-Finder',
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    return { results: [], totalCount: data.total_count || 0 };
  }

    const results: GitHubSearchResult[] = await Promise.all(
      data.items.map(async (item: any) => {
        let codePreview = '';
        let language: "AHK v1" | "AHK v2" = "AHK v1";
        
        try {
          const contentHeaders: Record<string, string> = {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'AHK-Script-Finder',
          };
          
          if (process.env.GITHUB_TOKEN) {
            contentHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
          }
          
          const contentResponse = await fetch(item.url, { headers: contentHeaders });
          
          if (contentResponse.ok) {
            const content = await contentResponse.text();
            const lines = content.split('\n').slice(0, 6);
            codePreview = lines.join('\n');
            
            if (content.includes('#Requires AutoHotkey v2') || content.includes('AutoHotkey v2')) {
              language = "AHK v2";
            }
          }
        } catch (error) {
          console.error('Error fetching file content:', error);
        }

        return {
          id: item.sha,
          repository: item.repository.name,
          owner: item.repository.owner.login,
          fileName: item.name,
          filePath: item.path,
          stars: item.repository.stargazers_count || 0,
          description: item.repository.description || '',
          codePreview,
          url: item.html_url,
          downloadUrl: item.download_url || `https://raw.githubusercontent.com/${item.repository.full_name}/${item.repository.default_branch}/${item.path}`,
          language,
        };
      })
    );

    return { results, totalCount: data.total_count || results.length };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/search/github", async (req, res) => {
    try {
      const validated = githubSearchSchema.parse(req.body);
      const { results, totalCount } = await searchGitHubForAHKScripts(validated.query, validated.page, validated.perPage);
      
      res.json({
        success: true,
        results,
        total: results.length,
        totalCount,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: 'Invalid request parameters' });
      } else {
        console.error('Search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        res.status(500).json({ success: false, error: errorMessage });
      }
    }
  });

  app.get("/api/scripts/curated", async (req, res) => {
    try {
      const scripts = await storage.getCuratedScripts();
      res.json({ success: true, scripts });
    } catch (error) {
      console.error('Error fetching curated scripts:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch curated scripts' });
    }
  });

  app.get("/api/scripts/personal", async (req, res) => {
    try {
      const scripts = await storage.getPersonalScripts();
      res.json({ success: true, scripts });
    } catch (error) {
      console.error('Error fetching personal scripts:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch scripts' });
    }
  });

  app.post("/api/scripts/personal", async (req, res) => {
    try {
      const validated = personalScriptSchema.parse(req.body);
      const script = await storage.createPersonalScript(validated);
      res.json({ success: true, script });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors });
      } else {
        console.error('Error creating script:', error);
        res.status(500).json({ success: false, error: 'Failed to create script' });
      }
    }
  });

  app.delete("/api/scripts/personal/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePersonalScript(req.params.id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, error: 'Script not found' });
      }
    } catch (error) {
      console.error('Error deleting script:', error);
      res.status(500).json({ success: false, error: 'Failed to delete script' });
    }
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AutoHotkey programmer. Generate clean, well-commented AutoHotkey v2 scripts based on user requests. Always include #Requires AutoHotkey v2.0 at the top. Provide only the script code, no explanations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const generatedCode = response.choices[0]?.message?.content || '';
      res.json({ success: true, code: generatedCode });
    } catch (error) {
      console.error('Error generating script:', error);
      res.status(500).json({ success: false, error: 'Failed to generate script' });
    }
  });

  app.post("/api/ai/transcribe", async (req, res) => {
    try {
      const { pythonCode, ahkCode, issue, operation } = req.body;
      
      let systemPrompt = '';
      let userPrompt = '';

      if (operation === 'convert') {
        systemPrompt = 'You are an expert in both Python and AutoHotkey. Convert Python code to AutoHotkey v1 with accurate functionality, proper syntax, and helpful comments. Provide ONLY the AutoHotkey code without explanations.';
        userPrompt = `Convert this Python code to AutoHotkey:\n\n${pythonCode}`;
      } else if (operation === 'validate') {
        systemPrompt = 'You are an expert code reviewer for Python-to-AutoHotkey conversions. Analyze if the conversion is accurate and identify any issues.';
        userPrompt = `Original Python:\n${pythonCode}\n\nConverted AHK:\n${ahkCode}\n\nIs this conversion accurate? List any issues or confirm it's correct.`;
      } else if (operation === 'debug') {
        systemPrompt = 'You are an expert AutoHotkey debugger. Fix issues in converted code and provide the corrected version. Provide ONLY the fixed AutoHotkey code.';
        userPrompt = `Original Python:\n${pythonCode}\n\nCurrent AHK:\n${ahkCode}\n\nIssue: ${issue}\n\nProvide the fixed AutoHotkey code.`;
      } else {
        return res.status(400).json({ success: false, error: 'Invalid operation' });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });

      const result = response.choices[0]?.message?.content || '';
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error in transcriber:', error);
      res.status(500).json({ success: false, error: 'Failed to process request' });
    }
  });

  app.post("/api/ai/game-script", async (req, res) => {
    try {
      const { gameName, taskDescription, scriptType } = req.body;
      
      if (!gameName || !taskDescription) {
        return res.status(400).json({ success: false, error: 'Game name and task description are required' });
      }

      const systemPrompt = 'You are an expert in AutoHotkey game automation. Generate complete, production-ready AutoHotkey scripts with proper error handling, safety features, and clear comments.';
      const userPrompt = `Generate a complete AutoHotkey script for the following:

Game: ${gameName}
Task: ${taskDescription}
Script Type: ${scriptType}

Requirements:
1. Include proper error handling
2. Add clear comments explaining each section
3. Use efficient AutoHotkey coding practices
4. Include safety features (pause/exit hotkeys like F1 to pause, F2 to exit)
5. Make it ready to run without modifications

Provide ONLY the AutoHotkey code without explanations or markdown formatting.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
      });

      const result = response.choices[0]?.message?.content || '';
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error generating game script:', error);
      res.status(500).json({ success: false, error: 'Failed to generate game script' });
    }
  });

  // Big Games PS99 API Routes
  const PS99_API_BASE = 'https://ps99.biggamesapi.io/api';

  app.get("/api/ps99/clans", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sort = (req.query.sort as string) || 'Points';
      const sortOrder = (req.query.sortOrder as string) || 'desc';

      const url = `${PS99_API_BASE}/clans?page=${page}&pageSize=${pageSize}&sort=${sort}&sortOrder=${sortOrder}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching clans:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch clans data' });
    }
  });

  app.get("/api/ps99/clan/:name", async (req, res) => {
    try {
      const clanName = encodeURIComponent(req.params.name);
      const url = `${PS99_API_BASE}/clan/${clanName}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ status: 'error', message: 'Clan not found' });
        }
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching clan:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch clan data' });
    }
  });

  app.get("/api/ps99/clan-battle", async (req, res) => {
    try {
      const url = `${PS99_API_BASE}/activeClanBattle`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching clan battle:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch clan battle data' });
    }
  });

  app.get("/api/ps99/rap", async (req, res) => {
    try {
      const url = `${PS99_API_BASE}/rap`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching RAP data:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch RAP data' });
    }
  });

  app.get("/api/ps99/exists", async (req, res) => {
    try {
      const url = `${PS99_API_BASE}/exists`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching exists data:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch exists data' });
    }
  });

  app.get("/api/ps99/collections", async (req, res) => {
    try {
      const url = `${PS99_API_BASE}/collections`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch collections' });
    }
  });

  app.get("/api/ps99/collection/:name", async (req, res) => {
    try {
      const collectionName = encodeURIComponent(req.params.name);
      const url = `${PS99_API_BASE}/collection/${collectionName}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching collection:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch collection data' });
    }
  });

  app.get("/api/ps99/exists", async (req, res) => {
    try {
      const type = req.query.type as string;
      const id = req.query.id as string;
      
      if (!type || !id) {
        return res.status(400).json({ status: 'error', message: 'Type and ID are required' });
      }

      const url = `${PS99_API_BASE}/exists/${encodeURIComponent(type)}/${encodeURIComponent(id)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PS99 API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error checking existence:', error);
      res.status(500).json({ status: 'error', message: 'Failed to check existence' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
