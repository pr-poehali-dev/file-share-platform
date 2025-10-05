import json
import os
import base64
from datetime import datetime
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Download file by ID and increment download counter
    Args: event - dict with httpMethod, pathParams
          context - object with request_id attribute
    Returns: HTTP response dict with file data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    path_params = event.get('pathParams', {})
    file_id = path_params.get('id', '')
    
    if not file_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'File ID required'})
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    now = datetime.utcnow()
    cur.execute(
        "SELECT name, file_data, mime_type, expires_at "
        "FROM files WHERE id = %s",
        (file_id,)
    )
    
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'File not found'})
        }
    
    filename, file_data, mime_type, expires_at = row
    
    if expires_at < now:
        cur.close()
        conn.close()
        return {
            'statusCode': 410,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'File expired'})
        }
    
    cur.execute(
        "UPDATE files SET download_count = download_count + 1 WHERE id = %s",
        (file_id,)
    )
    conn.commit()
    
    cur.close()
    conn.close()
    
    file_base64 = base64.b64encode(file_data).decode('utf-8')
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': mime_type or 'application/octet-stream',
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': True,
        'body': file_base64
    }
