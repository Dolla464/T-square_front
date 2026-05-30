import { useEffect, useState } from "react";
import { getWebsiteMedia } from "../services/discovery";

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

export const useHeroAndAboutData = () => {
  const [heroImage, setHeroImage] = useState(null);
  const [aboutImages, setAboutImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // جلب البيانات بالتوازي من الـ API الموحد
        const [heroRes, aboutRes] = await Promise.all([
          getWebsiteMedia("hero_image"),
          getWebsiteMedia("about_media"),
        ]);

        setHeroImage(heroRes?.data?.data?.hero_image);
        setAboutImages(aboutRes?.data?.data?.about_images || []);
      } catch (err) {
        console.error("Error fetching website content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return { heroImage, aboutImages, loading };
};
