
#!/usr/bin/env python3
from flask import Flask, request, jsonify, Response
import os
import sys
import json
import traceback
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Default data file path
DEFAULT_DATA_PATH = "/app/data/data.json"

# Initialize empty data structure
def get_initial_data():
    logger.info("Generating initial data structure")
    return {
        "operations": [],
        "employees": [
            {"id": "aneta", "name": "Aneta"},
            {"id": "ewa", "name": "Ewa"},
            {"id": "adam", "name": "Adam"},
            {"id": "piotr", "name": "Piotr"}
        ],
        "machines": [
            {"id": "drukarka", "name": "Drukarka", "icon": "printer"},
            {"id": "autobox", "name": "Autobox", "icon": "package"},
            {"id": "bigówka", "name": "Bigówka", "icon": "scissors"}
        ],
        "projects": []
    }

# Ensure data directory is writable
def ensure_data_directory(dir_path):
    try:
        # Create directory if it doesn't exist
        os.makedirs(dir_path, exist_ok=True)
        
        # Check if directory is writable
        test_file = os.path.join(dir_path, ".test_write")
        try:
            with open(test_file, 'w') as f:
                f.write("test")
            os.remove(test_file)
            logger.info(f"Directory {dir_path} is writable")
            return True
        except Exception as e:
            logger.error(f"Directory {dir_path} is not writable: {str(e)}")
            return False
    except Exception as e:
        logger.error(f"Error checking directory {dir_path}: {str(e)}")
        return False

# Ensure data file exists and is writable
def ensure_data_file(file_path):
    try:
        dir_path = os.path.dirname(file_path)
        
        # Ensure directory exists and is writable
        if not ensure_data_directory(dir_path):
            logger.error(f"Cannot proceed: directory {dir_path} not writable")
            return False
        
        # Log file path and status
        logger.info(f"Checking data file: {file_path}")
        logger.info(f"File exists: {os.path.exists(file_path)}")
        
        # Create file with initial data if it doesn't exist
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            try:
                with open(file_path, 'w') as f:
                    json.dump(get_initial_data(), f, indent=2)
                logger.info(f"Created new data file at {file_path}")
            except Exception as e:
                logger.error(f"Failed to create data file: {str(e)}")
                return False
            
        # Set permissions to ensure it's writable
        try:
            os.chmod(file_path, 0o666)
            logger.info(f"Set permissions on {file_path}")
        except Exception as e:
            logger.warning(f"Could not set permissions on {file_path}: {str(e)}")
        
        # Test if file is readable
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                logger.info(f"Successfully read data file with {len(data.get('operations', []))} operations")
            return True
        except Exception as e:
            logger.error(f"Error reading data file: {str(e)}")
            return False
    except Exception as e:
        logger.error(f"Error ensuring data file: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        return False

# Get data from file with fallback to initial data
def get_data_from_file(file_path):
    try:
        # If file doesn't exist, create it
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            ensure_data_file(file_path)
            
        with open(file_path, 'r') as f:
            data = json.load(f)
            logger.info(f"Read {len(data.get('operations', []))} operations from {file_path}")
            return data
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error in {file_path}: {str(e)}")
        # If JSON is invalid, return initial data
        return get_initial_data()
    except Exception as e:
        logger.error(f"Error reading data file: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        # Return initial data if file can't be read
        return get_initial_data()

# Save data to file with backup
def save_data_to_file(file_path, data):
    try:
        # Ensure directory exists
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)
        
        # Create backup of current file if it exists
        if os.path.exists(file_path):
            backup_path = f"{file_path}.bak"
            try:
                with open(file_path, 'r') as src, open(backup_path, 'w') as dst:
                    dst.write(src.read())
                logger.info(f"Created backup at {backup_path}")
            except Exception as e:
                logger.warning(f"Failed to create backup: {str(e)}")
        
        # Write new data
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Verify data was written correctly
        try:
            with open(file_path, 'r') as f:
                _ = json.load(f)
            logger.info(f"Successfully saved and verified data file {file_path}")
            return True
        except Exception as e:
            logger.error(f"Data verification failed after save: {str(e)}")
            return False
    except Exception as e:
        logger.error(f"Error saving data: {str(e)}")
        traceback.print_exc(file=sys.stderr)
        return False

# Route handler for /data endpoint (no = before path)
@app.route('/data', methods=['GET', 'POST', 'OPTIONS'])
def handle_data():
    # Log all incoming requests
    logger.info(f"Received {request.method} request to /data")
    logger.info(f"Headers: {request.headers}")
    
    # For OPTIONS requests, return CORS headers immediately
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS request")
        resp = app.make_default_options_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-File-Path'
        return resp
    
    # Get file path from header or use default
    file_path = request.headers.get('X-File-Path', DEFAULT_DATA_PATH)
    logger.info(f"Using data file: {file_path}")
    
    # Ensure data file exists
    if not ensure_data_file(file_path):
        error_resp = {"error": f"Could not ensure data file exists: {file_path}"}
        return Response(json.dumps(error_resp), status=500, mimetype='application/json')
    
    if request.method == 'GET':
        try:
            data = get_data_from_file(file_path)
            logger.info(f"Sending {len(data.get('operations', []))} operations from {file_path}")
            # Ensure we always return JSON
            resp = Response(json.dumps(data), mimetype='application/json')
            resp.headers['Content-Type'] = 'application/json'
            return resp
        except Exception as e:
            logger.error(f"Error processing GET request: {str(e)}")
            traceback.print_exc(file=sys.stderr)
            error_resp = {"error": str(e)}
            return Response(json.dumps(error_resp), status=500, mimetype='application/json')
    
    elif request.method == 'POST':
        try:
            # Parse the JSON data from request
            logger.info(f"Received POST data: {request.data[:100]}...")
            
            try:
                data = request.get_json()
            except Exception as e:
                logger.error(f"Failed to parse JSON: {str(e)}")
                logger.info(f"Raw data: {request.data}")
                error_resp = {"error": f"Invalid JSON data: {str(e)}"}
                return Response(json.dumps(error_resp), status=400, mimetype='application/json')
            
            if data is None:
                error_resp = {"error": "Invalid JSON data or missing request body"}
                return Response(json.dumps(error_resp), status=400, mimetype='application/json')
            
            logger.info(f"Saving data with {len(data.get('operations', []))} operations to {file_path}")
            
            # Write the data to file
            if save_data_to_file(file_path, data):
                success_resp = {"success": True}
                return Response(json.dumps(success_resp), mimetype='application/json')
            else:
                error_resp = {"error": "Failed to save data"}
                return Response(json.dumps(error_resp), status=500, mimetype='application/json')
                
        except Exception as e:
            logger.error(f"Error processing POST request: {str(e)}")
            traceback.print_exc(file=sys.stderr)
            error_resp = {"error": str(e)}
            return Response(json.dumps(error_resp), status=500, mimetype='application/json')
    
    # Handle other methods
    error_resp = {"message": "Method not allowed"}
    return Response(json.dumps(error_resp), status=405, mimetype='application/json')

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check data file access
        file_path = DEFAULT_DATA_PATH
        file_accessible = ensure_data_file(file_path)
        
        response_data = {
            "status": "healthy" if file_accessible else "unhealthy",
            "file_path": file_path,
            "file_accessible": file_accessible
        }
        
        status_code = 200 if file_accessible else 500
        return jsonify(response_data), status_code
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting file handler server on http://0.0.0.0:8000")
    
    # Ensure data directory and file exist on startup
    file_path = DEFAULT_DATA_PATH
    if ensure_data_file(file_path):
        logger.info(f"Data file ready at {file_path}")
    else:
        logger.critical(f"Failed to ensure data file {file_path}")
    
    # Run with debug mode off in production for security
    app.run(host='0.0.0.0', port=8000, debug=True)
