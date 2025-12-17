import { Request, Response } from "express";
import { SequenceService } from "../services/sequenceService";

export class SequenceController {
  static async createSequence(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { sequence, description } = req.body;

      const result = await SequenceService.createSequence(userId, sequence, description);

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async searchSequence(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          message: "Query parameter 'q' is required",
        });
        return;
      }

      const keywordOrId = isNaN(Number(q)) ? String(q) : Number(q);

      const results = await SequenceService.searchSequences(keywordOrId);

      res.status(200).json({
        success: true,
        message: results.length > 0 ? "Sequences found" : "No sequences found",
        data: results,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

    static async getMySequences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const result = await SequenceService.getUserSequences(userId);

      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  
    static async getAAllSequences(req: Request, res: Response): Promise<void> {
    try {
      const result = await SequenceService.getAllSequences();

      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

}