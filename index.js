import puppeteer from "puppeteer";
import fs from "fs";

const url = "https://www.reddit.com/r/WordpressPlugins/";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on("console", async (msg) => {
    const args = msg.args();
    const vals = [];
    for (let i = 0; i < args.length; i++) {
      vals.push(await args[i].jsonValue());
    }
    console.log(vals.join("\t"));
  });
  await page.goto(url);
  await page.evaluate(() => {
    const wait = (duration) => {
      console.log("waiting", duration);
      return new Promise((resolve) => setTimeout(resolve, duration));
    };

    (async () => {
      window.atBottom = false;
      const scroller = document.documentElement; // usually what you want to scroll, but not always
      let lastPosition = -1;
      while (!window.atBottom) {
        scroller.scrollTop += 1000;
        // scrolling down all at once has pitfalls on some sites: scroller.scrollTop = scroller.scrollHeight;
        await wait(3000);
        const currentPosition = scroller.scrollTop;
        if (currentPosition > lastPosition) {
          console.log("currentPosition", currentPosition);
          lastPosition = currentPosition;
        } else {
          window.atBottom = true;
        }
      }
      console.log("Done!");
    })();
  });

  await page.waitForFunction("window.atBottom == true", {
    timeout: 900000,
    polling: 1000, // poll for finish every second
  });

  // WILL DELETE
  await page.screenshot({ path: "example.png", fullPage: true });

  var rposts = await page.evaluate(() => {
    let posts = document.querySelectorAll(".Post");
    postItems = [];
    posts.forEach((post) => {
      let title = post.querySelector("h3").innerText;
      // let votes = post.querySelectorAll("div > span").innerText;
      let description = "";

      try {
        description = post.querySelector("p").innerText;
      } catch (err) {}

      postItems.push({
        title: title,
        // votes: votes,
        description: description,
      });
    });

    return postItems;
  });

  let csvContent = rposts
    .map((element) => {
      return Object.values(element)
        .map((item) => `"${item}"`)
        .join(",");
    })
    .join("\n");

  fs.writeFile(
    "reddit_posts.csv",
    "Title, Description" + "\n" + csvContent,
    "utf8",
    function (err) {
      if (err) {
        console.log(
          "Some error occurred - file either not saved or corrupted."
        );
      } else {
        console.log("File has been saved!");
      }
    }
  );

  await browser.close();
})();

// .then(async (browser) => {
//   const page = await browser.newPage();
//   await page.goto("https://www.reddit.com/r/WordpressPlugins/");
//   await page.waitForSelector("body");

//   var rposts = await page.evaluate(() => {
//     let posts = document.querySelectorAll(".Post");
//     postItems = [];
//     posts.forEach((post) => {
//       let title = post.querySelector("h3").innerText;
//       // let votes = post.querySelectorAll("div > span").innerText;
//       let description = "";

//       try {
//         description = post.querySelector("p").innerText;
//       } catch (err) {}

//       postItems.push({
//         title: title,
//         // votes: votes,
//         description: description,
//       });
//     });

//     return postItems;
//   });

//   let csvContent = rposts
//     .map((element) => {
//       return Object.values(element)
//         .map((item) => `"${item}"`)
//         .join(",");
//     })
//     .join("\n");

//   fs.writeFile(
//     "reddit_posts.csv",
//     "Title, Description" + "\n" + csvContent,
//     "utf8",
//     function (err) {
//       if (err) {
//         console.log(
//           "Some error occurred - file either not saved or corrupted."
//         );
//       } else {
//         console.log("File has been saved!");
//       }
//     }
//   );

//   await browser.close();
// })
// .catch((err) => {
//   console.log(err);
// });
