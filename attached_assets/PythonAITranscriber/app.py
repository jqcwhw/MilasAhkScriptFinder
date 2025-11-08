import os
import streamlit as st
from anthropic import Anthropic
from pygments import highlight
from pygments.lexers import PythonLexer, AutohotkeyLexer
from pygments.formatters import HtmlFormatter
import time
import database

# Initialize database (only if configured)
if database.is_database_available():
    try:
        database.init_db()
    except Exception as e:
        pass

# Initialize Anthropic client using Replit AI Integrations
AI_INTEGRATIONS_ANTHROPIC_API_KEY = os.environ.get("AI_INTEGRATIONS_ANTHROPIC_API_KEY")
AI_INTEGRATIONS_ANTHROPIC_BASE_URL = os.environ.get("AI_INTEGRATIONS_ANTHROPIC_BASE_URL")

client = Anthropic(
    api_key=AI_INTEGRATIONS_ANTHROPIC_API_KEY,
    base_url=AI_INTEGRATIONS_ANTHROPIC_BASE_URL
)

# Page configuration
st.set_page_config(
    page_title="Python to AutoHotkey Converter",
    page_icon="🔄",
    layout="wide"
)

# Initialize session state
if 'converted_code' not in st.session_state:
    st.session_state.converted_code = ""
if 'validation_result' not in st.session_state:
    st.session_state.validation_result = ""
if 'python_code' not in st.session_state:
    st.session_state.python_code = ""
if 'conversion_history' not in st.session_state:
    st.session_state.conversion_history = []

def convert_python_to_ahk(python_code: str) -> str:
    """Convert Python code to AutoHotkey using Claude AI"""
    prompt = f"""Convert the following Python code to AutoHotkey (AHK) script.
Make sure the conversion is accurate and follows AutoHotkey best practices.
Include comments explaining the conversion where necessary.

Python code:
```python
{python_code}
```

Provide ONLY the AutoHotkey code without any explanations or markdown formatting."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=8192,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        if message.content[0].type == "text":
            return message.content[0].text
        else:
            return "Error: Unexpected response type from AI"
    except Exception as e:
        return f"Error during conversion: {str(e)}"

def validate_ahk_code(python_code: str, ahk_code: str) -> str:
    """Validate the converted AutoHotkey code using Claude AI"""
    prompt = f"""You are an expert in both Python and AutoHotkey. Review this code conversion and validate if it's correct.

Original Python code:
```python
{python_code}
```

Converted AutoHotkey code:
```ahk
{ahk_code}
```

Please analyze:
1. Is the conversion accurate?
2. Does the AutoHotkey code preserve the functionality of the Python code?
3. Are there any syntax errors or issues?
4. Are there any potential runtime errors?

Provide a clear assessment with specific feedback."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=8192,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        if message.content[0].type == "text":
            return message.content[0].text
        else:
            return "Error: Unexpected response type from AI"
    except Exception as e:
        return f"Error during validation: {str(e)}"

def debug_ahk_code(python_code: str, ahk_code: str, issue_description: str = "") -> str:
    """Debug the AutoHotkey code and provide fixes"""
    prompt = f"""You are an expert debugger for Python to AutoHotkey conversions.

Original Python code:
```python
{python_code}
```

Converted AutoHotkey code:
```ahk
{ahk_code}
```

{f"Issue reported: {issue_description}" if issue_description else "Please identify any potential issues in this conversion."}

Please:
1. Identify the problem(s)
2. Explain why it's occurring
3. Provide the corrected AutoHotkey code
4. Explain what was fixed"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=8192,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        if message.content[0].type == "text":
            return message.content[0].text
        else:
            return "Error: Unexpected response type from AI"
    except Exception as e:
        return f"Error during debugging: {str(e)}"

def highlight_code(code: str, lexer) -> str:
    """Apply syntax highlighting to code"""
    formatter = HtmlFormatter(style='monokai', noclasses=True, linenos=False)
    return highlight(code, lexer, formatter)

def generate_game_script(game_name: str, task_description: str, script_type: str) -> str:
    """Generate AutoHotkey game automation script using Claude AI"""
    prompt = f"""You are an expert in AutoHotkey game automation. Generate a complete, working AutoHotkey script for the following task:

Game: {game_name}
Task: {task_description}
Script Type: {script_type}

Create a production-ready AutoHotkey script that:
1. Includes proper error handling
2. Has clear comments explaining each section
3. Uses efficient AutoHotkey coding practices
4. Includes safety features (pause/exit hotkeys)
5. Is ready to run without modifications

Provide ONLY the AutoHotkey code without explanations or markdown formatting."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=8192,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        if message.content[0].type == "text":
            return message.content[0].text
        else:
            return "Error: Unexpected response type from AI"
    except Exception as e:
        return f"Error during script generation: {str(e)}"

# App Header
st.title("🔄 Python to AutoHotkey Converter")
st.markdown("Convert Python scripts to AutoHotkey with AI-powered validation and debugging")

# Create tabs for different functionalities
tab1, tab2, tab3, tab4, tab5 = st.tabs(["Convert", "Saved Scripts", "Game Helper", "History", "About"])

with tab1:
    # Input section
    st.header("Input Python Code")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        # Text area input
        python_input = st.text_area(
            "Paste your Python code here:",
            height=300,
            value=st.session_state.python_code,
            placeholder="# Enter your Python code here\nprint('Hello, World!')"
        )
        
        # File upload option
        uploaded_file = st.file_uploader("Or upload a Python file (.py)", type=['py'])
        
        if uploaded_file is not None:
            python_input = uploaded_file.read().decode('utf-8')
            st.session_state.python_code = python_input
    
    with col2:
        st.subheader("Quick Actions")
        
        # Sample code button
        if st.button("Load Sample Code"):
            sample_code = """# Sample Python script
import time

def greet(name):
    print(f"Hello, {name}!")
    time.sleep(1)
    print("How are you today?")

greet("User")"""
            st.session_state.python_code = sample_code
            st.rerun()
        
        # Clear button
        if st.button("Clear All"):
            st.session_state.python_code = ""
            st.session_state.converted_code = ""
            st.session_state.validation_result = ""
            st.rerun()
    
    # Conversion buttons
    st.markdown("---")
    col_btn1, col_btn2, col_btn3 = st.columns(3)
    
    with col_btn1:
        convert_button = st.button("🔄 Convert to AutoHotkey", type="primary", use_container_width=True)
    
    with col_btn2:
        validate_button = st.button("✅ Validate Conversion", use_container_width=True)
    
    with col_btn3:
        debug_button = st.button("🐛 Debug Code", use_container_width=True)
    
    # Conversion logic
    if convert_button:
        if python_input.strip():
            st.session_state.python_code = python_input
            with st.spinner("Converting Python to AutoHotkey..."):
                converted = convert_python_to_ahk(python_input)
                st.session_state.converted_code = converted
                
                # Add to history
                st.session_state.conversion_history.append({
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
                    'python': python_input[:100] + "..." if len(python_input) > 100 else python_input,
                    'ahk': converted[:100] + "..." if len(converted) > 100 else converted
                })
                
                st.success("Conversion complete!")
                st.rerun()
        else:
            st.error("Please enter some Python code first!")
    
    # Validation logic
    if validate_button:
        if st.session_state.converted_code and st.session_state.python_code:
            with st.spinner("Validating conversion..."):
                validation = validate_ahk_code(st.session_state.python_code, st.session_state.converted_code)
                st.session_state.validation_result = validation
                st.success("Validation complete!")
                st.rerun()
        else:
            st.error("Please convert code first before validating!")
    
    # Debug logic
    if debug_button:
        if st.session_state.converted_code and st.session_state.python_code:
            # Optional: Allow user to describe the issue
            issue_desc = st.text_input("Describe the issue (optional):", key="issue_input")
            
            with st.spinner("Debugging code..."):
                debug_result = debug_ahk_code(
                    st.session_state.python_code, 
                    st.session_state.converted_code,
                    issue_desc
                )
                st.session_state.validation_result = debug_result
                st.success("Debugging complete!")
                st.rerun()
        else:
            st.error("Please convert code first before debugging!")
    
    # Output section
    if st.session_state.converted_code:
        st.markdown("---")
        st.header("Converted AutoHotkey Code")
        
        # Display options
        display_col1, display_col2 = st.columns([3, 1])
        
        with display_col1:
            st.subheader("AutoHotkey Output")
        
        with display_col2:
            # Download button
            st.download_button(
                label="📥 Download",
                data=st.session_state.converted_code,
                file_name="converted_script.ahk",
                mime="text/plain",
                use_container_width=True
            )
        
        # Save to database form
        if database.is_database_available():
            with st.form("save_conversion_form", clear_on_submit=True):
                st.markdown("### 💾 Save to Database")
                save_name = st.text_input("Script name:", key="save_conversion_name")
                save_desc = st.text_input("Description (optional):", key="save_conversion_desc")
                submitted = st.form_submit_button("Save Script")
                
                if submitted and save_name:
                    try:
                        database.save_script(
                            name=save_name,
                            python_code=st.session_state.python_code,
                            ahk_code=st.session_state.converted_code,
                            description=save_desc or "Python to AHK conversion",
                            script_type="conversion"
                        )
                        st.success(f"✅ Saved '{save_name}' to database!")
                    except Exception as e:
                        st.error(f"Error saving script: {str(e)}")
                elif submitted and not save_name:
                    st.error("Please enter a script name")
        else:
            st.info("💡 Database not configured. Scripts can only be downloaded.")
        
        # Side-by-side comparison
        comp_col1, comp_col2 = st.columns(2)
        
        with comp_col1:
            st.markdown("**Python Code**")
            st.code(st.session_state.python_code, language="python", line_numbers=True)
        
        with comp_col2:
            st.markdown("**AutoHotkey Code**")
            st.code(st.session_state.converted_code, language="autohotkey", line_numbers=True)
        
        # Validation/Debug results
        if st.session_state.validation_result:
            st.markdown("---")
            st.header("AI Analysis")
            st.markdown(st.session_state.validation_result)

with tab2:
    st.header("💾 Saved Scripts")
    
    if not database.is_database_available():
        st.warning("⚠️ Database is not configured. Please set up a PostgreSQL database to use this feature.")
        st.info("Scripts can still be downloaded from the Convert and Game Helper tabs.")
    else:
        try:
            saved_scripts = database.get_all_scripts()
            
            if saved_scripts:
                st.markdown(f"Total saved scripts: **{len(saved_scripts)}**")
                
                # Filter by type
                filter_col1, filter_col2 = st.columns([3, 1])
                with filter_col1:
                    filter_type = st.selectbox(
                        "Filter by type:",
                        ["All", "Conversion", "Game Helper"],
                        key="filter_type"
                    )
                
                filtered_scripts = saved_scripts
                if filter_type != "All":
                    filtered_scripts = [s for s in saved_scripts if s.script_type == filter_type.lower().replace(" ", "_")]
                
                for script in filtered_scripts:
                    with st.expander(f"📄 {script.name} - {script.created_at.strftime('%Y-%m-%d %H:%M')}"):
                        if script.description:
                            st.markdown(f"**Description:** {script.description}")
                        st.markdown(f"**Type:** {script.script_type}")
                        
                        col1, col2, col3 = st.columns([1, 1, 1])
                        
                        with col1:
                            if st.button("📥 Load", key=f"load_{script.id}"):
                                st.session_state.python_code = script.python_code
                                st.session_state.converted_code = script.ahk_code
                                st.success(f"Loaded '{script.name}'!")
                                st.rerun()
                        
                        with col2:
                            st.download_button(
                                label="📥 Download",
                                data=script.ahk_code,
                                file_name=f"{script.name}.ahk",
                                mime="text/plain",
                                key=f"download_{script.id}"
                            )
                        
                        with col3:
                            if st.button("🗑️ Delete", key=f"delete_{script.id}"):
                                database.delete_script(script.id)
                                st.success(f"Deleted '{script.name}'!")
                                st.rerun()
                        
                        st.markdown("---")
                        code_col1, code_col2 = st.columns(2)
                        
                        with code_col1:
                            if script.python_code:
                                st.markdown("**Python Code:**")
                                st.code(script.python_code, language="python", line_numbers=True)
                        
                        with code_col2:
                            st.markdown("**AutoHotkey Code:**")
                            st.code(script.ahk_code, language="autohotkey", line_numbers=True)
            else:
                st.info("No saved scripts yet. Convert some code and save it to get started!")
        except Exception as e:
            st.error(f"Error loading scripts: {str(e)}")

with tab3:
    st.header("🎮 AI Game Helper")
    st.markdown("Generate AutoHotkey game automation scripts with AI assistance")
    
    st.markdown("### Script Generator")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        game_name = st.text_input(
            "Game Name:",
            placeholder="e.g., Minecraft, League of Legends, etc.",
            key="game_name"
        )
        
        task_description = st.text_area(
            "What should the script do?",
            height=200,
            placeholder="Describe the automation task in detail. For example:\n- Auto-click at specific coordinates every 2 seconds\n- Press 'Q' every time health drops below 50%\n- Farm resources by repeating a sequence of actions\n- Detect and click on specific colored pixels",
            key="task_desc"
        )
    
    with col2:
        script_type = st.selectbox(
            "Script Type:",
            [
                "Auto-Clicker",
                "Macro/Hotkey",
                "Resource Farmer",
                "Combat Assistant",
                "Movement Bot",
                "Item Finder",
                "Screen Monitor",
                "Custom Script"
            ],
            key="script_type"
        )
        
        st.markdown("### Common Templates")
        
        if st.button("Simple Auto-Clicker", use_container_width=True):
            st.session_state["task_desc"] = "Create an auto-clicker that clicks the left mouse button every 100 milliseconds when F1 is pressed. Press F2 to pause/resume, and F3 to exit."
            st.rerun()
        
        if st.button("Healing Bot", use_container_width=True):
            st.session_state["task_desc"] = "Monitor a specific screen region for low health (red color). When detected, press '1' to use a healing potion. Include a cooldown timer."
            st.rerun()
        
        if st.button("Resource Collector", use_container_width=True):
            st.session_state["task_desc"] = "Repeat a sequence: Press 'E' to collect, wait 2 seconds, move mouse in a circle pattern, wait 1 second, repeat. F1 to start/stop."
            st.rerun()
    
    if st.button("🤖 Generate Game Script", type="primary", use_container_width=True):
        if game_name and task_description:
            with st.spinner("Generating game automation script..."):
                generated_script = generate_game_script(game_name, task_description, script_type)
                
                st.markdown("---")
                st.subheader("Generated AutoHotkey Script")
                
                save_col1, save_col2, save_col3 = st.columns([2, 1, 1])
                
                with save_col2:
                    st.download_button(
                        label="📥 Download",
                        data=generated_script,
                        file_name=f"{game_name.replace(' ', '_')}_bot.ahk",
                        mime="text/plain",
                        use_container_width=True
                    )
                
                
                st.code(generated_script, language="autohotkey", line_numbers=True)
                
                # Save to database form
                if database.is_database_available():
                    with st.form("save_game_script_form", clear_on_submit=True):
                        st.markdown("### 💾 Save to Database")
                        game_save_name = st.text_input("Script name:", key="game_script_name")
                        game_save_desc = st.text_input("Description (optional):", key="game_script_desc", value=f"{script_type} for {game_name}")
                        game_submitted = st.form_submit_button("Save Script")
                        
                        if game_submitted and game_save_name:
                            try:
                                database.save_script(
                                    name=game_save_name,
                                    python_code="",
                                    ahk_code=generated_script,
                                    description=game_save_desc or f"{script_type} for {game_name}",
                                    script_type="game_helper"
                                )
                                st.success(f"✅ Saved '{game_save_name}' to database!")
                            except Exception as e:
                                st.error(f"Error saving script: {str(e)}")
                        elif game_submitted and not game_save_name:
                            st.error("Please enter a script name")
                else:
                    st.info("💡 Database not configured. Scripts can only be downloaded.")
                
                st.markdown("---")
                st.warning("⚠️ **Important Safety Notes:**\n"
                          "- Test scripts in a safe environment first\n"
                          "- Many games have anti-cheat systems that may detect automation\n"
                          "- Use automation responsibly and check game terms of service\n"
                          "- Always include pause/exit hotkeys for safety")
        else:
            st.error("Please provide both game name and task description!")

with tab4:
    st.header("Conversion History")
    
    if st.session_state.conversion_history:
        st.markdown(f"Total conversions this session: **{len(st.session_state.conversion_history)}**")
        
        for idx, item in enumerate(reversed(st.session_state.conversion_history), 1):
            with st.expander(f"Conversion {len(st.session_state.conversion_history) - idx + 1} - {item['timestamp']}"):
                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("**Python:**")
                    st.code(item['python'], language="python")
                with col2:
                    st.markdown("**AutoHotkey:**")
                    st.code(item['ahk'], language="autohotkey")
    else:
        st.info("No conversions yet. Start converting Python code to AutoHotkey!")

with tab5:
    st.header("About This App")
    
    st.markdown("""
    ### Python to AutoHotkey Converter & Game Helper
    
    This application uses AI (Claude by Anthropic) to convert Python scripts into AutoHotkey (AHK) code and generate game automation scripts.
    
    **Features:**
    - 🔄 AI-powered Python to AutoHotkey conversion
    - ✅ Automatic validation of converted code
    - 🐛 Interactive debugging with AI assistance
    - 💾 Persistent storage for your scripts
    - 🎮 AI-powered game automation script generator
    - 📊 Side-by-side code comparison
    - 📥 Download converted scripts
    - 📜 Session history tracking
    
    **How to use the Converter:**
    1. Paste your Python code or upload a .py file
    2. Click "Convert to AutoHotkey"
    3. Review the converted code
    4. Use "Validate Conversion" to check accuracy
    5. Use "Debug Code" if you encounter issues
    6. Save or download your AutoHotkey script
    
    **How to use the Game Helper:**
    1. Go to the "Game Helper" tab
    2. Enter the game name
    3. Describe what you want the script to do
    4. Select the script type
    5. Generate your automation script
    6. Save or download the generated script
    
    **Note:** This tool uses Replit AI Integrations, which provides Claude API access. 
    Usage is billed to your Replit credits.
    
    **Limitations:**
    - Complex Python libraries may not have direct AutoHotkey equivalents
    - Some Python features may require manual adaptation
    - Game automation may violate terms of service - use responsibly
    - Always test scripts before production use
    
    **Tips:**
    - Start with simple scripts to understand the conversion patterns
    - Use the validation feature to catch potential issues
    - Save your favorite scripts for reuse
    - Check game terms of service before using automation
    """)