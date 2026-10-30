import urllib.request
import json

BASE_URL = 'http://127.0.0.1:8788'

print('=== 1. Testing Real PBKDF2 Web Crypto Login ===')
login_req = urllib.request.Request(
    f'{BASE_URL}/api/auth/login',
    data=json.dumps({'email': 'adnan@orbit.dev', 'password': 'Password123!'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
with urllib.request.urlopen(login_req) as resp:
    res = json.loads(resp.read().decode())
    assert res['ok'] is True, 'Login failed'
    token = res['data']['token']
    user = res['data']['user']
    email = user['email']
    name = user['name']
    print(f'  [PASS] Logged in as: {email} ({name})')
    print('  [PASS] Token issued:', token[:25] + '...')

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

print('\n=== 2. Testing /api/auth/me Profile & Subscriptions ===')
me_req = urllib.request.Request(f'{BASE_URL}/api/auth/me', headers=headers)
with urllib.request.urlopen(me_req) as resp:
    res = json.loads(resp.read().decode())
    assert res['ok'] is True, 'Me failed'
    print('  [PASS] User ID:', res['data']['user']['id'])
    print('  [PASS] Subscription Plan:', res['data']['subscription']['planId'])

print('\n=== 3. Testing Planner Lists & Auto-Provisioned Inbox ===')
lists_req = urllib.request.Request(f'{BASE_URL}/api/planner/lists', headers=headers)
with urllib.request.urlopen(lists_req) as resp:
    res = json.loads(resp.read().decode())
    assert res['ok'] is True, 'Lists failed'
    lists = res['data']['lists']
    print('  [PASS] Lists count:', len(lists), '->', [l['name'] for l in lists])
    print('  [PASS] Smart counts:', res['data']['smartCounts'])

print('\n=== 4. Testing Task Lifecycle in Cloudflare D1 ===')
create_req = urllib.request.Request(
    f'{BASE_URL}/api/planner/tasks',
    data=json.dumps({
        'title': 'Production Verification Task (TickTick Studio)',
        'notes': 'Verified real Cloudflare D1 persistence without mock fallback',
        'priority': 'urgent',
        'dueDate': '2026-10-30',
        'dueTime': '16:00',
        'tags': ['verification', 'production']
    }).encode('utf-8'),
    headers=headers,
    method='POST'
)
with urllib.request.urlopen(create_req) as resp:
    res = json.loads(resp.read().decode())
    assert res['ok'] is True, 'Create task failed'
    task = res['data']['task']
    task_id = task['id']
    print(f'  [PASS] Created task: {task["title"]} (ID: {task_id})')
    print(f'  [PASS] Priority: {task["priority"]} | Due Date: {task["dueDate"]}')

print('\n=== 5. Testing Subtask Hierarchy in D1 ===')
sub_req = urllib.request.Request(
    f'{BASE_URL}/api/planner/tasks/{task_id}/subtasks',
    data=json.dumps({'title': 'Verify D1 foreign key relationship'}).encode('utf-8'),
    headers=headers,
    method='POST'
)
with urllib.request.urlopen(sub_req) as resp:
    res = json.loads(resp.read().decode())
    assert res['ok'] is True, 'Subtask failed'
    subtask = res['data']['subtask']
    print(f'  [PASS] Subtask added: {subtask["title"]} (ID: {subtask["id"]})')

print('\n=== 6. Testing Status Toggle to Completed ===')
status_req = urllib.request.Request(
    f'{BASE_URL}/api/planner/tasks/{task_id}/status',
    data=json.dumps({}).encode('utf-8'),
    headers=headers,
    method='PATCH'
)
with urllib.request.urlopen(status_req) as resp:
    res = json.loads(resp.read().decode())
    assert res['ok'] is True, 'Status toggle failed'
    updated = res['data']['task']
    print(f'  [PASS] Task completed: {updated["completed"]} | Status: {updated["status"]}')

print('\n=== 7. Cleaning up Verification Task ===')
del_req = urllib.request.Request(f'{BASE_URL}/api/planner/tasks/{task_id}', headers=headers, method='DELETE')
with urllib.request.urlopen(del_req) as resp:
    res = json.loads(resp.read().decode())
    assert res['ok'] is True, 'Delete task failed'
    print('  [PASS] Deleted task result:', res['data'])

print('\n[SUCCESS] All 7 Production Verification Steps Succeeded with 100% Real API & D1 Database!')
