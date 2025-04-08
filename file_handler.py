
#!/usr/bin/env python3
from flask import Flask, request, jsonify
import os
import sys

app = Flask(__name__)

@app.route('/save_file', methods=['POST'])
def save_file():
    # Get the target file path from the header
    file_path = request.headers.get('X-File-Path')
    
    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    
    # Get the directory path
    dir_path = os.path.dirname(file_path)
    
    # Create directory if it doesn't exist
    os.makedirs(dir_path, exist_ok=True)
    
    try:
        # Write the request content to the file
        with open(file_path, 'wb') as f:
            f.write(request.data)
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_operations', methods=['POST'])
def save_operations():
    # Specific endpoint for operations
    file_path = request.headers.get('X-File-Path', '/app/data/operations.json')
    
    try:
        # Write the request content to the file
        with open(file_path, 'wb') as f:
            f.write(request.data)
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting file handler server on http://127.0.0.1:8000", file=sys.stderr)
    app.run(host='127.0.0.1', port=8000)
