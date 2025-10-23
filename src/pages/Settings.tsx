import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Settings page - DEPRECATED
 *
 * This page now redirects to /singleplayer.
 * The custom playground functionality is now inline in the singleplayer mode
 * under the "Custom Playground" tab.
 *
 * This redirect is maintained for backward compatibility with any existing
 * bookmarks or links to /settings.
 */
export default function Settings() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to singleplayer page
    navigate("/singleplayer", { replace: true });
  }, [navigate]);

  return null;
}
