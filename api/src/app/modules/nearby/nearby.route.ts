import express from 'express';
import { auth } from '../../middlewares/auth';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import https from 'https';

const router = express.Router();

// Proxy to Overpass API — keeps external calls server-side
const nearby = catchAsync(async (req: any, res: any) => {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radius},${lat},${lng});
          way["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radius},${lat},${lng});
        );
        out center tags;
    `;

    const postData = `data=${encodeURIComponent(query)}`;

    const result = await new Promise<any>((resolve, reject) => {
        const options = {
            hostname: 'overpass-api.de',
            path: '/api/interpreter',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Cliniq-HealthApp/1.0 (contact@cliniq.app)',
                'Accept': 'application/json',
            },
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => (data += chunk));
            response.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { reject(new Error('Invalid response from Overpass API')); }
            });
        });

        request.on('error', reject);
        request.write(postData);
        request.end();
    });

    // Normalise results
    const places = (result.elements || [])
        .filter((el: any) => el.tags?.name)
        .map((el: any) => ({
            id: el.id,
            name: el.tags.name,
            type: el.tags.amenity,
            address: [
                el.tags['addr:street'],
                el.tags['addr:city'],
            ].filter(Boolean).join(', ') || el.tags['addr:full'] || 'Address not available',
            phone: el.tags.phone || el.tags['contact:phone'] || null,
            lat: el.lat ?? el.center?.lat,
            lng: el.lon ?? el.center?.lon,
        }))
        .filter((p: any) => p.lat && p.lng);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Found ${places.length} healthcare facilities nearby`,
        data: places,
    });
});

router.get('/', auth('patient', 'doctor', 'admin'), nearby);

export const NearbyRouter = router;
