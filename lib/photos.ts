import type { ListingPhoto } from "./types";

/**
 * Gallery photo manifest — GENERATED FROM DISK, not hand-written.
 *
 * These are the reference's own 43 photos, captured to public/assets/images with
 * their original uuid filenames so the public URLs match the reference exactly.
 * Widths/heights are the files' real intrinsic dimensions (read from the JPEG
 * headers), so next/image reserves the right box and the gallery never shifts.
 *
 * Two aspect ratios are present: 1440x1080 (4:3, 37 files) and 1440x808 (16:9, 6).
 *
 * Alt text is assigned in listing.ts, where the room context lives.
 */
export const PHOTO_FILES: Omit<ListingPhoto, "alt">[] = [
  { id: "p1", src: "/assets/images/0622ab42-b851-4d55-9d9f-df3143bc5909.jpeg", width: 1440, height: 1080 },
  { id: "p2", src: "/assets/images/090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg", width: 1440, height: 1080 },
  { id: "p3", src: "/assets/images/153aa732-4935-48b8-a6fe-b469b6af5efc.jpeg", width: 1440, height: 1080 },
  { id: "p4", src: "/assets/images/1c827136-4a85-4fe0-8e69-3fd8ea19bb17.jpeg", width: 1440, height: 1080 },
  { id: "p5", src: "/assets/images/2367476f-11c4-4a14-a7c6-267be62c1d59.jpeg", width: 1440, height: 1080 },
  { id: "p6", src: "/assets/images/23ea6621-6f74-4baa-acea-2fd03e312b41.jpeg", width: 1440, height: 808 },
  { id: "p7", src: "/assets/images/246bd88d-4dd6-4117-a401-02a36ebfcf16.jpeg", width: 1440, height: 1080 },
  { id: "p8", src: "/assets/images/30ad93b2-293f-494d-b645-626303c6cb93.jpeg", width: 1440, height: 1080 },
  { id: "p9", src: "/assets/images/34529829-a971-44d3-ac2f-90ea3678a34d.jpeg", width: 1440, height: 1080 },
  { id: "p10", src: "/assets/images/3c6e6809-1bb1-47a6-8e24-aff593e1c28f.jpeg", width: 1440, height: 1080 },
  { id: "p11", src: "/assets/images/3c90338e-86b4-423f-aae1-279e0ccc3a18.jpeg", width: 1440, height: 1080 },
  { id: "p12", src: "/assets/images/3cf31697-f3f3-4c60-82c4-029acb119ae4.jpeg", width: 1440, height: 1080 },
  { id: "p13", src: "/assets/images/42befad7-fb29-473d-91db-b03e7a544d1d.jpeg", width: 1440, height: 808 },
  { id: "p14", src: "/assets/images/48a8ffbc-fbf7-4f84-bc29-ee400da3f08b.jpeg", width: 1440, height: 1080 },
  { id: "p15", src: "/assets/images/4fede77d-7a71-446f-89e3-263af937f3fa.jpeg", width: 1440, height: 1080 },
  { id: "p16", src: "/assets/images/56c44812-52c0-4481-90d8-101ec1f34c7a.jpeg", width: 1440, height: 1080 },
  { id: "p17", src: "/assets/images/5adfdf3e-d497-4efc-ab8c-fc559dab311e.jpeg", width: 1440, height: 808 },
  { id: "p18", src: "/assets/images/5b856fde-a393-41bf-b373-c9d02e64221f.jpeg", width: 1440, height: 808 },
  { id: "p19", src: "/assets/images/608748cd-6ee7-4a71-88a2-ba79d3ddba5a.jpeg", width: 1440, height: 808 },
  { id: "p20", src: "/assets/images/67c61c6f-6260-4809-9510-0360e58a345d.jpeg", width: 1440, height: 1080 },
  { id: "p21", src: "/assets/images/70325367-cbae-4993-b560-18cd3f6edd53.jpeg", width: 1440, height: 1080 },
  { id: "p22", src: "/assets/images/79addceb-8c2d-419b-80ff-e29af426a94c.jpeg", width: 1440, height: 1080 },
  { id: "p23", src: "/assets/images/79f59adb-5a5f-4d6c-8109-1f01f4ca0d03.jpeg", width: 1440, height: 1080 },
  { id: "p24", src: "/assets/images/862d936c-0f34-4e50-af87-b519e2781d19.jpeg", width: 1440, height: 1080 },
  { id: "p25", src: "/assets/images/8eb65a8b-e795-4870-b141-6f63b1be24ae.jpeg", width: 1440, height: 1080 },
  { id: "p26", src: "/assets/images/929545d3-e241-46c0-8a70-c24531ce7b54.jpeg", width: 1440, height: 1080 },
  { id: "p27", src: "/assets/images/9642a60d-e9de-4e1a-89c2-9ebd230f4a74.jpeg", width: 1440, height: 1080 },
  { id: "p28", src: "/assets/images/97c78f8a-5090-4663-aebc-ba4e13b47092.jpeg", width: 1440, height: 1080 },
  { id: "p29", src: "/assets/images/9aa8e65f-94ac-4ba0-9a10-9ec91e536d22.jpeg", width: 1440, height: 1080 },
  { id: "p30", src: "/assets/images/9be71047-fc52-438a-9270-75cb470f6752.jpeg", width: 1440, height: 1080 },
  { id: "p31", src: "/assets/images/a45feaa2-b607-4092-83ac-5fd4b2894959.jpeg", width: 1440, height: 1080 },
  { id: "p32", src: "/assets/images/a74e3c0b-3188-4442-9146-1cd4d6ea45df.jpeg", width: 1440, height: 1080 },
  { id: "p33", src: "/assets/images/a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg", width: 1440, height: 1080 },
  { id: "p34", src: "/assets/images/b6599f26-d65c-4df0-baf2-ef18c82a86a3.jpeg", width: 1440, height: 1080 },
  { id: "p35", src: "/assets/images/c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d.jpeg", width: 1440, height: 808 },
  { id: "p36", src: "/assets/images/cc7a56bd-242c-498a-9aef-0cffac619e54.jpeg", width: 1440, height: 1080 },
  { id: "p37", src: "/assets/images/dc01fd46-b119-48d3-a43b-f6c093e26eca.jpeg", width: 1440, height: 1080 },
  { id: "p38", src: "/assets/images/ddc853d7-e658-405c-bedc-8f31106c447e.jpeg", width: 1440, height: 1080 },
  { id: "p39", src: "/assets/images/f19d8c0a-1d88-42a4-9218-686d4f0db7e4.jpeg", width: 1440, height: 1080 },
  { id: "p40", src: "/assets/images/f1da1c3d-0d10-481e-9b63-c71f9073f30b.jpeg", width: 1440, height: 1080 },
  { id: "p41", src: "/assets/images/f6de1663-4e9c-4414-b63b-29a154a92ee1.jpeg", width: 1440, height: 1080 },
  { id: "p42", src: "/assets/images/fc02f48f-a937-42c5-895d-f9cc3113d6ca.jpeg", width: 1440, height: 1080 },
  { id: "p43", src: "/assets/images/fe37b80e-da8a-4225-b27b-dfbb5d763c01.jpeg", width: 1440, height: 1080 },
];
