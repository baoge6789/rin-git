import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { timeago } from "../utils/timeago";
import { HashTag } from "./hashtag";
import { useEffect, useRef } from "react";
import { drawBlurhashToCanvas } from "../utils/blurhash";
import { parseImageUrlMetadata } from "../utils/image-upload";
import { useImageLoadState } from "../utils/use-image-load-state";
import { type FeedCardVariant, normalizeFeedCardVariant } from "./feed-card-options";
import { useSiteConfig } from "../hooks/useSiteConfig";

function FeedCardImage({ src, variant }: { src: string; variant: FeedCardVariant }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { src: cleanSrc, blurhash, width, height } = parseImageUrlMetadata(src);
    const { failed, imageRef, loaded, onError, onLoad } = useImageLoadState(cleanSrc);
    const imageFrameClass =
        variant === "editorial"
            ? "relative flex-shrink-0 w-32 h-24 overflow-hidden rounded-[20px]"
            : "relative flex-shrink-0 w-32 h-24 overflow-hidden rounded-xl";

    useEffect(() => {
        if (!blurhash || !canvasRef.current) {
            return;
        }
        try {
            drawBlurhashToCanvas(canvasRef.current, blurhash);
        } catch (error) {
            console.error("Failed to render blurhash", error);
        }
    }, [blurhash]);

    return (
        <div className={imageFrameClass}>
            {blurhash && !loaded ? (
                <canvas
                    ref={canvasRef}
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover"
                />
            ) : null}
            <img
                ref={imageRef}
                src={cleanSrc}
                alt=""
                width={width}
                height={height}
                onLoad={onLoad}
                onError={onError}
                className={`absolute inset-0 h-full w-full object-cover object-center ${blurhash && (!loaded || failed) ? "opacity-0" : "opacity-100"
                    }`}
            />
        </div>
    );
}

const FEED_CARD_STYLES: Record<
    FeedCardVariant,
    {
        card: string;
        imageWrap: string;
        meta: string;
        title: string;
    }
> = {
    default: {
        card: "my-2 inline-block w-full break-inside-avoid rounded-2xl bg-w p-4 duration-300 bg-button",
        imageWrap: "",
        meta: "text-gray-400 text-sm",
        title: "text-xl font-bold text-gray-700 dark:text-white text-pretty overflow-hidden",
    },
    editorial: {
        card: "my-3 inline-block w-full break-inside-avoid overflow-hidden rounded-[28px] border border-black/10 bg-w p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)] dark:border-white/10",
        imageWrap: "mb-3 overflow-hidden rounded-[22px] border border-black/5 dark:border-white/10",
        meta: "text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400",
        title: "text-2xl font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white text-pretty overflow-hidden",
    },
};

export type FeedCardProps = {
    id: string;
    avatar?: string;
    draft?: number;
    listed?: number;
    top?: number;
    title: string;
    hashtags?: { id: number; name: string }[];
    createdAt: Date;
    updatedAt: Date;
    preview?: boolean;
    variant?: FeedCardVariant;
};

export function FeedCard({
    id,
    title,
    avatar,
    draft,
    listed,
    top,
    hashtags,
    createdAt,
    updatedAt,
    preview = false,
    variant,
}: FeedCardProps) {
    const { t } = useTranslation();
    const siteConfig = useSiteConfig();
    const safeHashtags = Array.isArray(hashtags) ? hashtags : [];
    const activeVariant = normalizeFeedCardVariant(variant ?? siteConfig.feedCardVariant);
    const styles = FEED_CARD_STYLES[activeVariant];

    const cardContent = (
        <div className="flex gap-4 items-start">
            {avatar ? (
                <div className="flex-shrink-0">
                    <FeedCardImage src={avatar} variant={activeVariant} />
                </div>
            ) : null}
            <div className="flex-1 min-w-0">
                <h1 className={styles.title}>{title}</h1>
                <p className={`space-x-2 ${styles.meta}`}>
                    <span title={new Date(createdAt).toLocaleString()}>
                        {timeago(createdAt)}
                    </span>
                    {createdAt !== updatedAt && (
                        <span title={new Date(updatedAt).toLocaleString()}>
                            {t("feed_card.updated$time", { time: timeago(updatedAt) })}
                        </span>
                    )}
                </p>
                <p className={`space-x-2 ${styles.meta}`}>
                    {draft === 1 && <span>{t("draft")}</span>}
                    {listed === 0 && <span>{t("unlisted")}</span>}
                    {top === 1 && <span className="text-theme">{t("article.top.title")}</span>}
                </p>
                {safeHashtags.length > 0 && (
                    <div className="flex flex-row flex-wrap justify-start gap-2 mt-2">
                        {safeHashtags.map(({ name }, index) => (
                            <HashTag key={index} name={name} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const body = <div className={styles.card}>{cardContent}</div>;

    return preview ? body : <Link href={`/feed/${id}`} target="_blank" className="block w-full">{body}</Link>;
}