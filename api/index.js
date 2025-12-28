const axios = require('axios');

export default async function handler(req, res) {
    // إعدادات السماح بالوصول (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { mac } = req.query;
    const PORTAL_URL = 'http://testdi.proxytx.cloud/portal.php';

    if (!mac) return res.status(400).json({ error: 'MAC is required' });

    // الرأسيات الهامة جداً لإقناع السيرفر أننا ريسيفر
    const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) Mag200 sb2 embedded Safari/533.3',
        'Cookie': `mac=${encodeURIComponent(mac)}; stb_lang=en; timezone=GMT`,
        'Referer': 'http://testdi.proxytx.cloud/c/',
        'X-User-Agent': 'Model: MAG250; SW: 2.18-r14-pub-250'
    };

    try {
        // الخطوة 1: المصافحة (Handshake)
        const handshake = await axios.get(`${PORTAL_URL}?type=stb&action=handshake`, { headers: commonHeaders });
        const token = handshake.data.js ? handshake.data.js.token : null;

        if (!token) {
            return res.status(403).json({ error: 'Failed to get Token. Check MAC status.' });
        }

        // الخطوة 2: جلب القنوات باستخدام التوكن
        const response = await axios.get(`${PORTAL_URL}?type=itv&action=get_all_channels`, {
            headers: { 
                ...commonHeaders,
                'Authorization': `Bearer ${token}`
            }
        });

        // إرسال البيانات النهائية
        res.status(200).json(response.data.js.data);
    } catch (error) {
        console.error('Error details:', error.message);
        res.status(500).json({ error: 'Server Error: ' + error.message });
    }
}
