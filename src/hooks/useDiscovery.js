import { useEffect, useState } from "react";
import { getWebsiteMedia, getSetting } from "../services/discovery";

export const useDiscoveryMedia = () => {
  const [discoveryMedia, setDiscoveryMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        setLoading(true);
        // مررنا اسم الكي الخاص بالـ discovery للباك إند
        const res = await getWebsiteMedia("discovery_media");

        // الباك إند الحين بيرجعها جوه كائن اسمه images مباشرة
        const data = res?.data?.data?.images;
        setDiscoveryMedia(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFromAPI();
  }, []);

  return { discoveryMedia, loading, error };
};

export const clearHeroAndAboutCache = () => {
  try {
    sessionStorage.removeItem("hero_and_about_data");
  } catch (err) {
    console.error("Error clearing sessionStorage:", err);
  }
};

export const useHeroAndAboutData = () => {
  const [heroImage, setHeroImage] = useState(() => {
    try {
      const cached = sessionStorage.getItem("hero_and_about_data");
      return cached ? JSON.parse(cached).heroImage : null;
    } catch {
      return null;
    }
  });

  const [aboutImages, setAboutImages] = useState(() => {
    try {
      const cached = sessionStorage.getItem("hero_and_about_data");
      return cached ? JSON.parse(cached).aboutImages : [];
    } catch {
      return [];
    }
  });

  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem("hero_and_about_data");
      return cached ? JSON.parse(cached).heroSettings : {
        hero_title_en: "",
        hero_title_ar: "",
        hero_title_highlight_en: "",
        hero_title_highlight_ar: "",
        hero_subtitle_en: "",
        hero_subtitle_ar: "",
      };
    } catch {
      return {
        hero_title_en: "",
        hero_title_ar: "",
        hero_title_highlight_en: "",
        hero_title_highlight_ar: "",
        hero_subtitle_en: "",
        hero_subtitle_ar: "",
      };
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem("hero_and_about_data");
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hero_and_about_data")) {
        setLoading(false);
        return;
      }
    } catch (e) {
      // ignore sessionStorage error and proceed to fetch
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        // جلب البيانات بالتوازي من الـ API الموحد
        const [
          heroRes,
          aboutRes,
          titleEnRes,
          titleArRes,
          highlightEnRes,
          highlightArRes,
          subtitleEnRes,
          subtitleArRes,
        ] = await Promise.all([
          getWebsiteMedia("hero_image"),
          getWebsiteMedia("about_media"),
          getSetting("hero_title_en").catch(() => null),
          getSetting("hero_title_ar").catch(() => null),
          getSetting("hero_title_highlight_en").catch(() => null),
          getSetting("hero_title_highlight_ar").catch(() => null),
          getSetting("hero_subtitle_en").catch(() => null),
          getSetting("hero_subtitle_ar").catch(() => null),
        ]);

        const heroImageVal = heroRes?.data?.data?.hero_image || null;
        const aboutImagesVal = aboutRes?.data?.data?.about_images || [];

        const extractVal = (res) => {
          if (!res) return "";
          const body = res.data !== undefined ? res.data : res;
          if (!body) return "";
          if (typeof body === "string") return body;
          const data = body.data !== undefined ? body.data : body;
          if (!data) return "";
          if (typeof data === "string") return data;
          if (typeof data === "object" && data.value !== undefined && data.value !== null) {
            return data.value;
          }
          return "";
        };

        const heroSettingsVal = {
          hero_title_en: extractVal(titleEnRes),
          hero_title_ar: extractVal(titleArRes),
          hero_title_highlight_en: extractVal(highlightEnRes),
          hero_title_highlight_ar: extractVal(highlightArRes),
          hero_subtitle_en: extractVal(subtitleEnRes),
          hero_subtitle_ar: extractVal(subtitleArRes),
        };

        try {
          sessionStorage.setItem(
            "hero_and_about_data",
            JSON.stringify({
              heroImage: heroImageVal,
              aboutImages: aboutImagesVal,
              heroSettings: heroSettingsVal,
            })
          );
        } catch (e) {
          console.error("Failed to save to sessionStorage:", e);
        }

        setHeroImage(heroImageVal);
        setAboutImages(aboutImagesVal);
        setHeroSettings(heroSettingsVal);
      } catch (err) {
        console.error("Error fetching website content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return { heroImage, aboutImages, heroSettings, loading };
};
