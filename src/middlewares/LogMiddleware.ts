import type { Request, Response, NextFunction } from "express";
import LogsService from "../services/LogsService.js";

class LogMiddleware {
  static handle(req: Request, res: Response, next: NextFunction) {
    // Calcula o tempo inicial
    res.locals.startTime = Date.now();

    // Roda um listener atrelado ao encerramento (finish) do ciclo de resposta do express
    res.on("finish", () => {
      // Ignore logs for the /logs endpoint itself to prevent infinite loop logging or overly noisy logs
      if (req.originalUrl && req.originalUrl.includes("/logs")) {
        return;
      }

      const executionTime = Date.now() - res.locals.startTime;
      
      const user = (req as any).user;
      
      const payload = {
        tenant_id: user?.tenant_id || null, // Se ainda não deu auth (ex: login fake) fica null
        user_id: user?.id || null,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        response_time_ms: executionTime,
        message: res.locals.errorMessage || res.statusMessage || null, // Se tivermos capturado mensagem na resposta
      };

      // Dispara Service sem o await, fire and forget.
      LogsService.insertLog(payload);
    });

    next();
  }
}

export default LogMiddleware;
