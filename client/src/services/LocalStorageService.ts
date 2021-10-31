import PortfolioService from "./PortfolioService";

class LocalStorageService {
  private static instance: LocalStorageService;
  private constructor(private portfolioService: PortfolioService) {}

  public static getInstance(portfolioService: PortfolioService) {
    if (!LocalStorageService.instance) {
      return new LocalStorageService(portfolioService);
    }
    return LocalStorageService.instance;
  }

  save() {
    const snapshot = {
      portfolio: this.portfolioService.portfolio,
      balance: this.portfolioService.balance
    };
    localStorage.setItem('meme', JSON.stringify(snapshot));
  }

  load() {
    const snapshot = JSON.parse(localStorage.getItem('meme') || 'null');
    console.log(localStorage.getItem('meme'));
    if (!snapshot) return;
    this.portfolioService.portfolio = snapshot.portfolio;
    this.portfolioService.balance = snapshot.balance;
  }
}

export default LocalStorageService;