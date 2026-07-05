import { Pagination } from "react-bootstrap";

export const getLastPage = (pagination) =>
  pagination?.last_page ?? pagination?.total_pages ?? 1;

export default function AdminPagination({
  pagination,
  onPageChange,
  className = "",
  wrapperClassName = "d-flex justify-content-center mt-5",
}) {
  if (!pagination || pagination.total === 0) return null;

  const currentPage = pagination.current_page;
  const lastPage = getLastPage(pagination);
  const startPage = Math.floor((currentPage - 1) / 3) * 3 + 1;
  const endPage = Math.min(startPage + 2, lastPage);
  const items = [];

  if (startPage > 1) {
    items.push(
      <Pagination.Ellipsis
        key="prev-ellipsis"
        onClick={() => onPageChange(startPage - 1)}
      />
    );
  }

  for (let p = startPage; p <= endPage; p++) {
    items.push(
      <Pagination.Item
        style={{ margin: "0 3px" }}
        key={p}
        active={currentPage === p}
        onClick={() => onPageChange(p)}
      >
        {p}
      </Pagination.Item>
    );
  }

  if (endPage < lastPage) {
    items.push(
      <Pagination.Ellipsis
        key="next-ellipsis"
        onClick={() => onPageChange(endPage + 1)}
      />
    );
  }

  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      <Pagination className="custom-pagination mb-0">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {items}
        <Pagination.Next
          style={{ margin: "0 6px 0" }}
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </Pagination>
    </div>
  );
}
