import Hero from "./Hero";
import Biography from "./Biography";

import Departments from "./Departments";

const Home = () => {
  return (
    <>
      <Hero
        title={
          "Transforming Emergency Care with Smart & Efficient Solutions"
        }
        imageUrl={"./images/hero.png"}
      />
      <Biography imageUrl={"./images/about.png"} />
      <Departments/>
     
    </>
  );
};

export default Home;
