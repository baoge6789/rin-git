import { useTranslation } from "react-i18next";

type ImageUploadInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  shape?: "rounded" | "circle";
};

export function ImageUploadInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  shape = "rounded",
}: ImageUploadInputProps) {
  const { t } = useTranslation();

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div
          className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04] ${shapeClass}`}
        >
          {value ? (
            <img src={value} alt={t("upload.image.preview_alt")} className="h-full w-full object-cover" />
          ) : (
            <i className="ri-image-line text-3xl text-neutral-400" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <input
            type="url"
            value={value}
            disabled={disabled}
            placeholder={placeholder || t("upload.image.url_placeholder")}
            onChange={(event) => {
              onChange(event.target.value);
            }}
            className="w-full rounded-xl border border-black/10 bg-w px-4 py-3 text-sm t-primary outline-none transition-colors placeholder:text-neutral-400 focus:border-black/20 focus:ring-2 focus:ring-theme/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:placeholder:text-neutral-500 dark:focus:border-white/20"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled || value.length === 0}
              onClick={() => onChange("")}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-w px-3 py-2 text-sm t-secondary transition-colors hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:hover:border-white/20"
            >
              <i className="ri-close-line" aria-hidden="true" />
              <span>{t("upload.image.clear")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}