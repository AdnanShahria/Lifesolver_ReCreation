import glob
import sqlite3

files = glob.glob('backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite')
print('Found D1 files:', files)

for f in files:
    conn = sqlite3.connect(f)
    cur = conn.cursor()
    cur.execute('SELECT id, email FROM users WHERE email = ?', ('adnan@orbit.dev',))
    row = cur.fetchone()
    if not row:
        print(f'Inserting adnan@orbit.dev into {f}')
        cur.execute(
            '''INSERT INTO users (id, name, email, password_hash, password_salt, preferences, is_verified, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))''',
            (
                'usr_orbit_master_01',
                'Adnan Shahria',
                'adnan@orbit.dev',
                'e7e8e0e39f6cc18d0091b74e37f84bd51ec92f2f088b8796fcb9ad25bebcfb03',
                '316507852b7a98da430be9d1779fd454',
                '{"theme": "dark"}',
                1
            )
        )
    else:
        print(f'Updating adnan@orbit.dev password hash in {f}')
        cur.execute(
            '''UPDATE users SET 
                   password_hash = ?,
                   password_salt = ?,
                   is_verified = 1
               WHERE email = ?''',
            (
                'e7e8e0e39f6cc18d0091b74e37f84bd51ec92f2f088b8796fcb9ad25bebcfb03',
                '316507852b7a98da430be9d1779fd454',
                'adnan@orbit.dev'
            )
        )

    # Also ensure settings and subscription exist
    cur.execute('SELECT id FROM settings WHERE user_id = ?', ('usr_orbit_master_01',))
    if not cur.fetchone():
        print(f'Inserting settings for usr_orbit_master_01 in {f}')
        cur.execute(
            '''INSERT INTO settings (id, user_id, theme, currency, language, notifications_enabled, monthly_budget, dock_shortcuts, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))''',
            ('set_orbit_master_01', 'usr_orbit_master_01', 'dark', 'USD', 'en', 1, 5000, '["planner", "finance"]')
        )

    cur.execute('SELECT id FROM subscriptions WHERE user_id = ?', ('usr_orbit_master_01',))
    if not cur.fetchone():
        print(f'Inserting subscription for usr_orbit_master_01 in {f}')
        cur.execute(
            '''INSERT INTO subscriptions (id, user_id, plan_id, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))''',
            ('sub_orbit_master_01', 'usr_orbit_master_01', 'elite', 'active')
        )

    conn.commit()
    conn.close()
    print(f'Successfully updated {f}')
