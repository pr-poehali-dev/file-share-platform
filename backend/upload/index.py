import json
import os
import base64
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle file upload with auto-deletion after 24 hours
    Args: event - dict with httpMethod, body, headers
          context - object with request_id attribute
    Returns: HTTP response dict with file ID and download URL
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body = event.get('body', '')
    is_base64 = event.get('isBase64Encoded', False)
    
    if is_base64:
        body = base64.b64decode(body)
    
    content_type = event.get('headers', {}).get('content-type', '')
    
    if 'multipart/form-data' not in content_type:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Content-Type must be multipart/form-data'})
        }
    
    boundary = content_type.split('boundary=')[-1]
    parts = body.split(f'--{boundary}'.encode())
    
    file_data = None
    filename = None
    
    for part in parts:
        if b'Content-Disposition' in part:
            lines = part.split(b'\r\n')
            for i, line in enumerate(lines):
                if b'Content-Disposition' in line and b'filename=' in line:
                    filename_part = line.decode().split('filename=')[1].strip().strip('"')
                    filename = filename_part
                    file_data = b'\r\n'.join(lines[i+2:]).rstrip(b'\r\n')
                    break
    
    if not file_data or not filename:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'No file uploaded'})
        }
    
    file_id = str(uuid.uuid4())
    file_size = len(file_data)
    uploaded_at = datetime.utcnow()
    expires_at = uploaded_at + timedelta(hours=24)
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO files (id, name, size, file_data, uploaded_at, expires_at) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (file_id, filename, file_size, file_data, uploaded_at, expires_at)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'id': file_id,
            'name': filename,
            'size': file_size,
            'downloadUrl': f'/api/download/{file_id}',
            'expiresAt': expires_at.isoformat()
        })
    }
