const QueryStatus = ({ title, message, isError = false }) => {
  return (
    <div
      className="mx-auto my-12 max-w-2xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm"
      role={isError ? "alert" : "status"}
    >
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
};

export default QueryStatus;
