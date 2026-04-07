const items: Item[] = [
  {
    id: "a",
    category: "Travel",
    title: "5 Inspiring Apps for Your Next Trip",
    content: (
      <>
        <p className="big">
          Love to travel? So do the makers of these five subscription apps. For
          a small monthly fee, they'll help you find the best deals on flights,
          hotels, and some other stuff we turn a blind eye to.
        </p>
        <p className="big">
          Plan your perfect itinerary with intelligent recommendations based on
          your interests, time, and credit history.
        </p>
      </>
    ),
    top: -300,
  },
  {
    id: "c",
    category: "How to",
    title: "Contemplate the Meaning of Life Twice a Day",
    content: (
      <>
        <p className="big">
          What is life? You can't spell "life" without "i". You also can't spell
          "life" without "l", "f", and "e". Worth thinking about.
        </p>
        <p className="big">
          The only way to find out more about life is to think about it. And the
          only way to think about it is twice daily using an app.
        </p>
        <p className="big">
          Apps? We got 'em. Therefore we got the meaning of life.
        </p>
      </>
    ),
    bottom: -50,
    theme: "dark",
    width: "110%",
    left: -20,
  },
  {
    id: "d",
    category: "Steps",
    title: "Urban Exploration Apps for the Vertically-Inclined",
    content: (
      <>
        <p className="big">
          Get off the beaten path. Find the best views, skywalks, and elevated
          gardens in your city.
        </p>
        <p className="big">
          Locked door? No problem! This app crowdsources the access code to
          every door in your city.
        </p>
      </>
    ),
    theme: "dark",
    width: "200%",
    left: -100,
  },
  {
    id: "b",
    category: "Hats",
    title: "Take Control of Your Hat Life With This Stunning New App",
    content: (
      <>
        <p className="big">
          Whether you're serious hat enthusiast, or just a filthy casual, this
          new app revolutionizes how you organize, care for, and expand your hat
          collection.
        </p>
        <p className="big">
          Stay up to date with the latest hat trends, get personalized hat care
          reminders, and use predictive analytics to discover the last place you
          left your hat.
        </p>
        <p className="big">Why follow the crowd when you can be the crowd?</p>
      </>
    ),
    bottom: -100,
  },
];

export default items;
