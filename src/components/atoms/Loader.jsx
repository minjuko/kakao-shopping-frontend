const Loader = () => {
  return (
    <div className="flex min-h-[240px] items-center justify-center p-8" role="status" aria-label="불러오는 중">
      <div className="loader loader--style5">
        <svg
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="h-[90px] w-20"
          viewBox="0 0 24 30"
          style={{ enableBackground: 'new 0 0 50 50' }}
          xmlSpace="preserve"
        >
          <rect x="0" y="0" width="4" height="10" fill="#333">
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="translate"
              values="0 0; 0 20; 0 0"
              begin="0"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="10" y="0" width="4" height="10" fill="#333">
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="translate"
              values="0 0; 0 20; 0 0"
              begin="0.2s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="20" y="0" width="4" height="10" fill="#333">
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="translate"
              values="0 0; 0 20; 0 0"
              begin="0.4s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
        <span className="sr-only">불러오는 중</span>
      </div>
    </div>
  );
};

export default Loader;
