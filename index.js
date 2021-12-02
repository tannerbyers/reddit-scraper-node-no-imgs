import puppeteer from "puppeteer";
import fs from "fs";

puppeteer
  .launch({
    headless: true,
    args: [
      '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
    ],
  })
  .then(async (browser) => {
    const page = await browser.newPage();
    await page.goto("https://www.reddit.com/r/node/");
    await page.waitForSelector("body");

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
  })
  .catch((err) => {
    console.log(err);
  });
