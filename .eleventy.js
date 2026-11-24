// サイト固有の設定はこの定数だけ。blog と cookLog はこれ以外の内容を揃えている。
const SECTION = "tech";

const MONTHS_JA = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月"
];

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stripHtml(input) {
  return String(input || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueValues(items, key) {
  const set = new Set();
  items.forEach((item) => {
    const values = item?.data?.[key] || [];
    values.forEach((value) => {
      if (value) set.add(String(value));
    });
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
}

function buildArchives(items, section) {
  const buckets = new Map();

  items.forEach((item) => {
    const date = toDate(item.data.date);
    if (!date) return;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        year,
        month,
        monthPadded: String(month).padStart(2, "0"),
        key,
        posts: []
      });
    }
    buckets.get(key).posts.push(item);
  });

  const entries = Array.from(buckets.values())
    .map((entry) => {
      entry.posts.sort((a, b) => b.date - a.date);
      return {
        ...entry,
        count: entry.posts.length,
        section,
        url: `/${section}/${entry.year}/${entry.monthPadded}/`
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  const tree = entries.reduce((acc, entry) => {
    if (!acc[entry.year]) acc[entry.year] = {};
    acc[entry.year][entry.month] = {
      count: entry.count,
      url: entry.url
    };
    return acc;
  }, {});

  return { entries, tree };
}

module.exports = function (eleventyConfig) {
  const isProd = process.env.ELEVENTY_ENV === "production";

  eleventyConfig.addPassthroughCopy({ static: "." });

  eleventyConfig.addFilter("readableDate", (value) => {
    const date = toDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  });

  eleventyConfig.addFilter("monthLabel", (monthIndex) => {
    const index = Number(monthIndex) - 1;
    return MONTHS_JA[index] || "";
  });

  eleventyConfig.addFilter("pad2", (value) => String(value).padStart(2, "0"));

  eleventyConfig.addFilter("searchText", (value) => stripHtml(value));
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("uniqueCategories", (items) =>
    uniqueValues(items, "categories")
  );
  eleventyConfig.addFilter("uniqueTags", (items) => uniqueValues(items, "tags"));
  eleventyConfig.addFilter("buildArchives", (items, section) =>
    buildArchives(items || [], section)
  );
  eleventyConfig.addFilter("sortByDateDesc", (items) =>
    (items || []).slice().sort((a, b) => b.date - a.date)
  );

  // 本番ビルドでは下書きを除く。
  const sectionPosts = (collectionApi) =>
    collectionApi
      .getFilteredByGlob(`./content/${SECTION}/**/*.md`)
      .filter((item) => !item.data.draft || !isProd);

  eleventyConfig.addCollection(SECTION, (collectionApi) =>
    sectionPosts(collectionApi).sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection(`${SECTION}Archives`, (collectionApi) =>
    buildArchives(sectionPosts(collectionApi), SECTION).entries
  );

  return {
    dir: {
      input: "content",
      includes: "../layouts",
      data: "_data",
      output: "public"
    },
    templateFormats: ["md", "njk", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
