import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Challenges from "@/components/Challenges";
import Leaderboard from "@/components/Leaderboard";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Challenges />
      <Leaderboard />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
