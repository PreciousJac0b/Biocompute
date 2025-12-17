import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { SequenceController } from '../controllers/sequenceController';

const router = express.Router();

router.post('/', authMiddleware, SequenceController.createSequence);
router.get('/search', authMiddleware, SequenceController.searchSequence);
router.get('/my-sequences', authMiddleware, SequenceController.getMySequences);
router.get('/all-sequences', authMiddleware, SequenceController.getAAllSequences);

export default router;