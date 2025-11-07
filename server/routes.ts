import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { githubSearchSchema, personalScriptSchema, type GitHubSearchResult } from "@shared/schema";
import { z } from "zod";

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

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ success: false, error: 'OpenAI API key not configured' });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        return res.status(500).json({ success: false, error: 'Failed to generate script' });
      }

      const data = await response.json();
      const generatedCode = data.choices[0]?.message?.content || '';

      res.json({ success: true, code: generatedCode });
    } catch (error) {
      console.error('Error generating script:', error);
      res.status(500).json({ success: false, error: 'Failed to generate script' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
