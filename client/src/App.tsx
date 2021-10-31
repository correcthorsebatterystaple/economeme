import React, { Fragment, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import spinner from './assets/fidget-spinner.gif';
import './App.css';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
  Modal,
  Box,
} from '@mui/material';
import ApiService from './services/ApiService';
import PortfolioService from './services/PortfolioService';
import LocalStorageService from './services/LocalStorageService';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BasicModal from './components/BasicModal';

const apiService = ApiService.getInstance();
const portfolioService = PortfolioService.getInstance(apiService);
const localStorageService = LocalStorageService.getInstance(portfolioService);
localStorageService.load();

function usePrevious(value: any) {
  const ref = useRef<any>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function calculatePercentChange(curr: number, base: number) {
  return Math.round((curr / base - 1) * 100);
}

function App() {
  const [postLoading, setPostLoading] = useState(true);
  const [post, setPost] = useState<any>(null);

  const [portfolio, setPortfolio] = useState<any[]>(portfolioService.portfolio);
  const [prices, setPrices] = useState(portfolio.map((p) => p.price));
  const [changes, setChanges] = useState(portfolio.map(p => calculatePercentChange(p.price, p.buyPrice)));

  useEffect(() => {
    setPrices(portfolio.map((p) => p.price));
  }, [portfolio]);

  useEffect(() => {
    setChanges(portfolio.map(p => calculatePercentChange(p.price, p.buyPrice)));
  }, [portfolio, prices])

  useEffect(() => {
    setRandomPost();
    const interval = setInterval(() => {
      portfolioService.refresh().then(() => setPrices(portfolioService.portfolio.map((p) => p.price)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorageService.save();
  }, [portfolio]);

  const setRandomPost = () => {
    setPostLoading(true);
    apiService
      .getRandomPost()
      .then((res) => {
        if (portfolioService.has(res)) {
          setRandomPost();
          return;
        }
        setPost(res);
      })
      .then(() => setPostLoading(false));
  };

  const setSelectedPost = (permalink: string) => {
    apiService.getPost(permalink).then((res) => res && setPost(res));
  };

  const onBuy = () => {
    if (postLoading) return;
    if (portfolioService.buy(post)) {
      setPortfolio(portfolioService.portfolio);
      setRandomPost();
    }
  };

  const onSell = (i: number) => {
    portfolioService.sell(portfolio[i]);
    setPortfolio(portfolioService.portfolio);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleModalSubmit = (val: string) => {
    if (!val) {
      setRandomPost();
      return;
    }
    setSelectedPost(val);
  };
  console.log(portfolio);
  return (
    <div className="grid grid-cols-2">
      <div className="h-screen flex flex-col justify-between border-r border-black">
        <div className="flex justify-between gap-x-4 h-8 border-b border-black">
          {postLoading ? (
            <h2 className="text-center w-full">Loading...</h2>
          ) : (
            <Fragment>
              <h2>r/{post.subreddit}</h2>
              <h2 title={post.title} className="text-lg text-center truncate">
                <a href={'https://reddit.com' + post.permalink} target="blank" className="text-blue-600 underline">
                  {post.title}
                </a>
              </h2>
              <h2>{new Date(post.createdAt).toLocaleDateString('en-GB')}</h2>
            </Fragment>
          )}
        </div>
        <div className="h-4/5 overflow-y-auto flex align-center">
          <img src={postLoading ? spinner : post.imgUrl} alt="Meme" className="m-auto" />
        </div>
        <p className="text-center text-4xl">$ {postLoading ? '???' : post.buyPrice}</p>
        <div className="flex justify-around w-full">
          <Button onClick={() => onBuy()} color="success" variant="contained" sx={{width: '50%', borderRadius: '0'}}>BUY</Button>
          <Button onClick={() => setRandomPost()} sx={{width: '50%'}}>SKIP</Button>
        </div>
      </div>
      <div className="h-screen relative">
        <h2 className="text-2xl text-center">Portfolio</h2>
        <TableContainer className="h-4/5 overflow-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Preview</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <a href={`https://reddit.com${p.permalink}`} target="blank">
                      <img src={p.imgUrl} alt="preview" className="m-auto h-8" />
                    </a>
                  </TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{prices[i]}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-around">
                      <span
                        className={
                          (changes[i] > 0 ? 'text-green-600' : 'text-red-600') +
                          ' pt-2'
                        }
                      >
                        {changes[i]}%
                      </span>
                      <IconButton color="error" onClick={() => onSell(i)}>
                        <AttachMoneyIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="w-full text-center absolute bottom-4 flex justify-around">
          <h2 className="text-4xl">
            Value:&nbsp;
            <span className="text-green-600">
              $ {portfolioService.portfolio.reduce((acc, curr) => acc + curr.price, 0) + portfolioService.balance}
            </span>
          </h2>
          <h2 className="text-4xl">Balance: $ {portfolioService.balance}</h2>
        </div>
      </div>
      <BasicModal open={modalOpen} onClose={handleModalClose} onSubmit={handleModalSubmit}></BasicModal>
    </div>
  );
}

export default App;
