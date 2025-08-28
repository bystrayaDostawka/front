// PaginatedResponseDto.js
export default class PaginatedResponseDto {
  constructor(items = [], currentPage = 1, nextPage = null, lastPage = 1, total = 0) {
    this.items = items;
    this.currentPage = currentPage;
    this.nextPage = nextPage;
    this.lastPage = lastPage;
    this.total = total;
  }
}
