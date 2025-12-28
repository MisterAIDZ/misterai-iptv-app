// استخدام require بدلاً من import
const axios = require('axios');

// استخدام module.exports بدلاً من export default
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { mac } = req.query;
    const PORTAL_URL = 'http://testdi.proxytx.cloud/portal.php';

    // ... باقي الكود كما هو ...
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) Mag200 sb2 embedded Safari/533.3',
            'Cookie': `mac=${encodeURIComponent(mac)}; stb_lang=en; timezone=GMT`,
            'X-User-Agent': 'Model: MAG250; SW: 2.18-r14-pub-250'
        };

        const handshake = await axios.get(`${PORTAL_URL}?type=stb&action=handshake`, { headers });
        
        if (!handshake.data.js || !handshake.data.js.token) {
            return res.status(200).json({ error: "Authentication Failed", details: handshake.data });
        }

        const token = handshake.data.js.token;
        const response = await axios.get(`${PORTAL_URL}?type=itv&action=get_all_channels`, {
            headers: { ...headers, 'Authorization': `Bearer ${token}` }
        });

        res.status(200).json(response.data.js.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
