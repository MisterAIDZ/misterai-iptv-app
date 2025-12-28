const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { mac } = req.query;
    const PORTAL_URL = 'http://testdi.proxytx.cloud/portal.php';

    if (!mac) return res.status(400).json({ error: 'MAC address is required' });

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) Mag200 sb2 embedded Safari/533.3',
            'Cookie': `mac=${encodeURIComponent(mac)}; stb_lang=en; timezone=GMT`,
            'X-User-Agent': 'Model: MAG250; SW: 2.18-r14-pub-250',
            'Referer': 'http://testdi.proxytx.cloud/c/'
        };

        // 1. Handshake
        const handshake = await axios.get(`${PORTAL_URL}?type=stb&action=handshake`, { headers });
        const token = handshake.data.js ? handshake.data.js.token : null;

        if (!token) {
            return res.status(200).json({ error: "الماك محظور أو الاشتراك منتهي", raw: handshake.data });
        }

        // 2. جلب القنوات
        const response = await axios.get(`${PORTAL_URL}?type=itv&action=get_all_channels`, {
            headers: { ...headers, 'Authorization': `Bearer ${token}` }
        });

        res.status(200).json(response.data.js.data);
    } catch (error) {
        res.status(500).json({ error: "خطأ في الاتصال بالسيرفر", message: error.message });
    }
};
