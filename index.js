import puppeteer from "puppeteer";

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
        postItems.push({ title: title });
      });

      var items = {
        posts: postItems,
      };

      return items;
    });

    console.log(rposts);

    await browser.close();
  })
  .catch((err) => {
    console.log(err);
  });
