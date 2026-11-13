import DashboardService from "../services/dashboardService.js";

const dashboardService = new DashboardService();

export const obterDashboard = async (req, res) => {
  const dashboard = await dashboardService.obterDashboard(req.validado.query);
  return res.json(dashboard);
};