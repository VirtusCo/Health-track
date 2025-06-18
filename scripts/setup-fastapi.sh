#!/bin/bash

# Setup script for HealthScan FastAPI server
echo "Setting up HealthScan FastAPI server..."

# Create virtual environment
python -m venv healthscan_env

# Activate virtual environment
source healthscan_env/bin/activate  # On Windows: healthscan_env\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pillow python-multipart

# Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
pillow==10.1.0
python-multipart==0.0.6
pydantic==2.5.0
EOF

echo "Setup complete!"
echo "To start the server:"
echo "1. Activate environment: source healthscan_env/bin/activate"
echo "2. Run server: python scripts/fastapi-server.py"
echo "3. API docs will be available at: http://localhost:8000/docs"
