import CountUp from "./CountUp";

type Props = {
  /** Numeric value to count up to, OR text (e.g. "Master's") when `text` is set. */
  value: number | string;
  suffix?: string;
  label: string;
  text?: boolean;
};

/** A single big sage numeral (with count-up) + caption, for the stats band. */
export default function Stat({ value, suffix = "", label, text = false }: Props) {
  return (
    <div className="text-center">
      <div className="display text-5xl md:text-6xl lg:text-7xl text-sage-600">
        {text ? (
          (value as string)
        ) : (
          <CountUp to={value as number} suffix={suffix} />
        )}
      </div>
      <p className="mt-3 text-sm text-muted">{label}</p>
    </div>
  );
}
