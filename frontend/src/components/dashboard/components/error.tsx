export default function ErrorMsg(props: { error: string }) {
  return (
    <>
      {props.error !== "" ? (
        <div className="text-red-500 text-sm">{props.error}</div>
      ) : (
        <></>
      )}
    </>
  );
}
