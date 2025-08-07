#!/usr/bin/env python3
"""
Simple HTTP server for EngineerMemes.AI
Run with: python serve.py
Then share: http://YOUR_IP:8000
"""

import http.server
import socketserver
import os
import webbrowser
import socket
from pathlib import Path

def get_local_ip():
    try:
        # Connect to remote server to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

# Change to dist directory
os.chdir(Path(__file__).parent / "dist")

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

print("EngineerMemes.AI Server Starting...")
print("=" * 50)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    local_ip = get_local_ip()
    
    print(f"Server running at:")
    print(f"   Local:    http://localhost:{PORT}")
    print(f"   Network:  http://{local_ip}:{PORT}")
    print()
    print(f"Share this URL with friends:")
    print(f"   http://{local_ip}:{PORT}")
    print()
    print("To stop server: Press Ctrl+C")
    print("=" * 50)
    
    # Open browser automatically
    webbrowser.open(f"http://localhost:{PORT}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped. Thanks for using EngineerMemes.AI!")