// 2개 이상의 api endpoint를 호출한다. -완료(renderBookType(),renderEbooks())
// 검색이 가능하다 - 완료
// pagenation이 있다. - 완료
// 반응형 웹페이지다. - 완료
// +예외처리 -완료

// google books api 호출
const API_KEY = "AIzaSyAPh60JPVQnnRLccL-f4fpts49ZBnei26c";
let url = new URL(
  `https://www.googleapis.com/books/v1/volumes?q=*&key=${API_KEY}`
);

let page = 1;
const groupSize = 5;
let totalBooks = 0;
let startIndex = 0; // 검색결과 색인(0부터 시작)
const maxResults = 5; // pageSize

const getBooks = async () => {
  try {
    url.searchParams.set("startIndex", startIndex);
    url.searchParams.set("maxResults", maxResults);
    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 200) {
      if (data.totalItems === 0) {
        throw new Error("검색결과가 없습니다.");
      }
      console.log("response", response);
      console.log("data", data);
      booksData = data.items;

      // totalBooks가 페이지마다 바뀌어 에러가 생길수 있기 때문에
      // 1페이지에서의 totalBooks로 고정하였음.
      if (startIndex === 0) {
        totalBooks = data.totalItems;
      }

      // 책 개수가 110개 이상일 경우 반환값에 에러있을 수 있으므로 110개로 제한하였음.
      if (totalBooks >= 110) {
        totalBooks = 110;
      }

      console.log("totalBooks", totalBooks);
      renderBooks();
      renderPagination();
    } else {
      throw new Error("잘못된 요청입니다.");
    }
  } catch (e) {
    errorRender(e.message);
  }
};

// getBooks(); 첫화면에서 페이지네이션 에러가 있어서 공백 검색이 첫화면이 되도록함. 

const errorRender = (message) => {
  const errorHTML = `<div class="alert alert-danger" role="alert">
  ${message}
</div>`;
  document.querySelector(".result-area").innerHTML = errorHTML;
};

const renderBooks = () => {
  let resultHTML = ``;
  const noImage = "https://ekari.jp/wp-content/uploads/2020/12/noimage.png";
  resultHTML = booksData.map((item) => {
    return `<div class="books row">
    <div class="col-lg-4">
    <img
    src=${
      item.volumeInfo.hasOwnProperty("imageLinks") === true
        ? item.volumeInfo.imageLinks.thumbnail
        : noImage
    }
    alt=""
    />
    </div>
    <div class="col-lg-8">
    <h5>제목: ${item.volumeInfo.title}</h5>
    <h6>저자: ${item.volumeInfo.authors || "-"}</h6>
    <p>소개: ${
      item.volumeInfo.description === undefined
        ? "-"
        : item.volumeInfo.description.length > 100
        ? item.volumeInfo.description.substring(1, 100) + "..."
        : item.volumeInfo.description
    }</p>
    <h6>출판사: ${item.volumeInfo.publisher || "-"}</h6>
    <h6>출판일: ${item.volumeInfo.publishedDate || "-"}</h6>
    </div>
    </div>`;
  });
  document.querySelector(".result-area").innerHTML = resultHTML.join("");
};

// 검색창
const searchButton = document.querySelector(".search-button");
const userSearch = document.querySelector(".user-search");

searchButton.addEventListener("click", () => {
  renderSearch();
});

// 엔터키 눌렀을 때 검색버튼 클릭과 같은 효과
userSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    renderSearch();
  }
});

const renderSearch = async () => {
  startIndex = 0;
  page = 1;
  url = new URL(
    `https://www.googleapis.com/books/v1/volumes?q=intitle:${userSearch.value}&key=${API_KEY}`
  );
  getBooks();
};

renderSearch();

// 입력창 포커스시 공백으로 초기화
userSearch.addEventListener("focus", (e) => {
  e.target.value = "";
});

// 도서 유형
// magazines의 유형이 일반적인 잡지의 의미와 다름. 대다수가 books이며 극소수의 책만 magazines로 분류됨
const bookTypeButtons = document.querySelectorAll(".more-search button");

bookTypeButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    renderBookType(e);
  });
});

const renderBookType = async (e) => {
  startIndex = 0;
  page = 1;
  url = new URL(
    `https://www.googleapis.com/books/v1/volumes?q=intitle:${userSearch.value}&printType=${e.target.innerText}&key=${API_KEY}`
  );
  getBooks();
};

// ebook 검색
const ebookButton = document.querySelector(".ebook-button");

ebookButton.addEventListener("click", () => {
  renderEbooks();
});

const renderEbooks = async () => {
  startIndex = 0;
  page = 1;
  url = new URL(
    `https://www.googleapis.com/books/v1/volumes?q=intitle:${userSearch.value}&filter=ebooks&key=${API_KEY}`
  );
  getBooks();
};

// 페이지네이션
const renderPagination = () => {
  let pageGroup = Math.ceil(page / groupSize);
  let lastPage = pageGroup * groupSize;
  let firstPage = lastPage - (groupSize - 1);
  let totalPages = Math.ceil(totalBooks / maxResults);

  // 전체페이지 수가 그룹사이즈보다 작을 때 전체페이지 수만큼의 페이지네이션 출력
  if (totalPages < groupSize) {
    lastPage = totalPages;
  }

  // 마지막 페이지가 그룹사이즈보다 작을 때 마지막페이지까지만 페이지네이션 출력
  if (totalPages < pageGroup * groupSize) {
    lastPage = totalPages;
  }

  let paginationHTML = ``;

  if (page > 1) {
    paginationHTML += `<li onclick="moveToPage(1)" class="page-item"><a class="page-link">&lt&lt</a></li>
  <li onclick="moveToPage(${
    page - 1
  })" class="page-item"><a class="page-link">&lt</a></li>`;
  }

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `<li onclick="moveToPage(${i})" class="${
      page === i ? "active" : ""
    } page-item"><a class="page-link">${i}</a></li>`;
  }

  if (page < totalPages)
    paginationHTML += `<li onclick="moveToPage(${
      page + 1
    })" class="page-item"><a class="page-link">&gt</a></li>
  <li onclick="moveToPage(${totalPages})" class="page-item"><a class="page-link">&gt&gt</a></li>`;

  document.querySelector(".pagination").innerHTML = paginationHTML;
};

const moveToPage = async (pageNum) => {
  page = pageNum; // page 매개변수가 없기때문에 page를 직접 변경해준다.
  startIndex = maxResults * (pageNum - 1); // page에 따라 startIndex가 0부터 10씩 증가한다.
  getBooks();
};
