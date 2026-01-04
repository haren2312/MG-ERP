"""
Simple GUI Launcher for Light ERP Module
Double-click to start the application
"""
import sys
import os
import subprocess
import webbrowser
import threading
import time
from pathlib import Path

# Try to import tkinter, fallback to basic console if not available
try:
    import tkinter as tk
    from tkinter import messagebox
    HAS_GUI = True
except ImportError:
    HAS_GUI = False

class LightERPLauncher:
    def __init__(self):
        self.process = None
        self.app_dir = Path(__file__).parent
        self.exe_path = self.app_dir / "LightERP.exe"
        self.python_script = self.app_dir / "main.py"
        self.db_path = self.app_dir / "light_erp.db"
        self.port = 8005
        self.url = f"http://localhost:{self.port}"
        
        if HAS_GUI:
            self.create_gui()
        else:
            self.run_console()
    
    def create_gui(self):
        """Create a simple GUI window"""
        self.root = tk.Tk()
        self.root.title("Light ERP - Launcher")
        self.root.geometry("400x300")
        self.root.resizable(False, False)
        
        # Center the window
        self.root.eval('tk::PlaceWindow . center')
        
        # Title
        title = tk.Label(
            self.root,
            text="Light ERP Module",
            font=("Arial", 18, "bold"),
            fg="#3498db"
        )
        title.pack(pady=20)
        
        # Status label
        self.status_label = tk.Label(
            self.root,
            text="Ready to start",
            font=("Arial", 10),
            fg="#7f8c8d"
        )
        self.status_label.pack(pady=10)
        
        # Start button
        self.start_button = tk.Button(
            self.root,
            text="Start Application",
            command=self.start_app,
            bg="#27ae60",
            fg="white",
            font=("Arial", 12, "bold"),
            width=20,
            height=2,
            cursor="hand2"
        )
        self.start_button.pack(pady=10)
        
        # Stop button
        self.stop_button = tk.Button(
            self.root,
            text="Stop Application",
            command=self.stop_app,
            bg="#e74c3c",
            fg="white",
            font=("Arial", 12, "bold"),
            width=20,
            height=2,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.stop_button.pack(pady=10)
        
        # Info label
        info = tk.Label(
            self.root,
            text=f"Application will open at:\n{self.url}",
            font=("Arial", 9),
            fg="#7f8c8d"
        )
        info.pack(pady=10)
        
        # Handle window close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        self.root.mainloop()
    
    def update_status(self, message, color="#7f8c8d"):
        """Update status label"""
        if HAS_GUI:
            self.status_label.config(text=message, fg=color)
            self.root.update()
    
    def start_app(self):
        """Start the Light ERP application"""
        self.update_status("Starting application...", "#f39c12")
        self.start_button.config(state=tk.DISABLED)
        
        # Initialize database if needed
        if not self.db_path.exists():
            self.update_status("Initializing database...", "#f39c12")
            try:
                if self.exe_path.exists():
                    subprocess.run([str(self.exe_path), "init"], check=True)
                else:
                    subprocess.run([sys.executable, str(self.python_script)], check=True, timeout=5)
            except Exception as e:
                print(f"Database initialization: {e}")
        
        # Start the server in a separate thread
        threading.Thread(target=self._run_server, daemon=True).start()
        
        # Wait and open browser
        time.sleep(3)
        self.update_status("Opening browser...", "#3498db")
        webbrowser.open(self.url)
        
        self.update_status("Running", "#27ae60")
        self.stop_button.config(state=tk.NORMAL)
    
    def _run_server(self):
        """Run the server process"""
        try:
            if self.exe_path.exists():
                self.process = subprocess.Popen(
                    [str(self.exe_path)],
                    cwd=str(self.app_dir),
                    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
                )
            else:
                # Fallback to Python script
                self.process = subprocess.Popen(
                    [sys.executable, str(self.python_script)],
                    cwd=str(self.app_dir)
                )
            self.process.wait()
        except Exception as e:
            if HAS_GUI:
                messagebox.showerror("Error", f"Failed to start application:\n{e}")
            else:
                print(f"Error: {e}")
    
    def stop_app(self):
        """Stop the Light ERP application"""
        if self.process:
            self.update_status("Stopping...", "#f39c12")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except:
                self.process.kill()
            self.process = None
        
        self.update_status("Stopped", "#e74c3c")
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
    
    def on_closing(self):
        """Handle window closing"""
        if self.process:
            if messagebox.askokcancel("Quit", "Stop the application and quit?"):
                self.stop_app()
                self.root.destroy()
        else:
            self.root.destroy()
    
    def run_console(self):
        """Run in console mode without GUI"""
        print("=" * 50)
        print("Light ERP Module - Console Launcher")
        print("=" * 50)
        print()
        
        if not self.db_path.exists():
            print("Initializing database...")
            try:
                subprocess.run([sys.executable, str(self.python_script)], timeout=5)
            except:
                pass
        
        print(f"Starting Light ERP on {self.url}")
        print("Press Ctrl+C to stop")
        print()
        
        try:
            if self.exe_path.exists():
                subprocess.run([str(self.exe_path)], cwd=str(self.app_dir))
            else:
                subprocess.run([sys.executable, str(self.python_script)], cwd=str(self.app_dir))
        except KeyboardInterrupt:
            print("\nStopping...")

if __name__ == "__main__":
    launcher = LightERPLauncher()
