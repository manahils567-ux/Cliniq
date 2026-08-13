import express from 'express';
import { NewsletterController } from './newsletter.controller';

const router = express.Router();

/* Public — the subscribe form sits on the landing page.
   NOTE: signups are emailed to the admin inbox, not stored. A real subscriber
   list needs a table; that is a schema change and has not been made. */
router.post('/', NewsletterController.subscribe);

export const NewsletterRouter = router;
