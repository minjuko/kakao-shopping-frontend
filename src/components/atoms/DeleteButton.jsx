import Button from "./Button";

const DeleteButton = ({ label, onClick }) => (
  <Button
    className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
    aria-label={`${label} 삭제`}
    onClick={onClick}
  >
    삭제
  </Button>
);

export default DeleteButton;
