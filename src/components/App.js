import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import PodcastPage from "./components/PodcastPage";
import TopicsPage from "./components/TopicsPage";
import ContactPage from "./components/ContactPage";
import WhyBeard from "./components/WhyBeard";
import WakingUpEarly from "./components/WakingUpEarly";

function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/podcast" component={PodcastPage} />
        <Route path="/topics" component={TopicsPage} />
        <Route path="/form" component={ContactPage} />
        <Route path="/why-beard" component={WhyBeard} />
        <Route path="/waking-up-early" component={WakingUpEarly} />
      </Switch>
      <Footer />
    </Router>
  );
}

export default App;
