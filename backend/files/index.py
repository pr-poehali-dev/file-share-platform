import json
import os
from datetime import datetime
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get list of active files (not expired)
    Args: event - dict with httpMethod
          context - object with request_id attribute
    Returns: HTTP response dict with list of files
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
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    now = datetime.utcnow()
    cur.execute(
        "SELECT id, name, size, uploaded_at, expires_at "
        "FROM files WHERE expires_at > %s "
        "ORDER BY uploaded_at DESC",
        (now,)
    )
    
    rows = cur.fetchall()
    
    files = []
    for row in rows:
        files.append({
            'id': row[0],
            'name': row[1],
            'size': row[2],
            'uploadedAt': row[3].isoformat(),
            'expiresAt': row[4].isoformat(),
            'downloadUrl': f'/api/download/{row[0]}'
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'files': files})
    }
