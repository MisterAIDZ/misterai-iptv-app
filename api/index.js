// api/index.js
const axios = require('axios');

export default async function handler(req, res) {
    // إعدادات CORS للسماح للواجهة بالاتصال
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    const PORTAL_URL = 'http://testdi.proxytx.cloud/portal.php';
    const { mac } = req.query;

    if (!mac) return res.status(400).json({ error: 'MAC address is required' });

    try {
        // 1. Handshake للحصول على التوكن
        const handshake = await axios.get(PORTAL_URL, {
            params: { type: 'stb', action: 'handshake' },
            headers: { 
                'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) Mag200 sb2 embedded Safari/533.3',
                'Cookie': `mac=${encodeURIComponent(mac)}` 
            }
        });

        const token = handshake.data.js.token;

        // 2. جلب القنوات
        const response = await axios.get(PORTAL_URL, {
            params: { type: 'itv', action: 'get_all_channels' },
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Cookie': `mac=${encodeURIComponent(mac)}` 
            }
        });

        res.status(200).json(response.data.js.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
