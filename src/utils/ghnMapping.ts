// src/hooks/useGHNMapper.ts
import { useEffect, useState } from "react";
import axios from "axios";

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  NameExtension: string[];
}

export interface GHNDistrict {
  DistrictID: number;
  DistrictName: string;
  NameExtension: string[];
  ProvinceID: number;
}

export interface GHNWard {
  WardCode: string;
  WardName: string;
  NameExtension: string[];
  DistrictID: number;
}

export function useGHNMapper(token: string) {
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);

  // 1. Lấy danh sách tỉnh từ GHN
  useEffect(() => {
    axios
      .get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
        headers: { Token: token }
      })
      .then(res => setProvinces(res.data.data))
      .catch(err => console.error("Province fetch error", err));
  }, [token]);

  // 2. Hàm lấy District theo provinceId
  const fetchDistricts = (provinceId: number) => {
    axios
      .get("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
        headers: { Token: token },
        params: { province_id: provinceId }
      })
      .then(res => setDistricts(res.data.data))
      .catch(err => console.error("District fetch error", err));
  };

  // 3. Hàm lấy Ward theo districtId
  const fetchWards = (districtId: number) => {
    axios
      .get("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward", {
        headers: { Token: token },
        params: { district_id: districtId }
      })
      .then(res => setWards(res.data.data))
      .catch(err => console.error("Ward fetch error", err));
  };

  // 4. Các hàm mapping
  const findProvinceId = (name: string): number | null => {
    const norm = name.trim().toLowerCase();
    for (const p of provinces) {
      if (p.ProvinceName.toLowerCase() === norm || p.NameExtension?.some(n => n.toLowerCase() === norm)) {
        return p.ProvinceID;
      }
    }
    return null;
  };

  const findDistrictId = (name: string, provinceId: number): number | null => {
    const norm = name.trim().toLowerCase();
    for (const d of districts) {
      if (d.ProvinceID !== provinceId) continue;
      if (d.DistrictName.toLowerCase() === norm || d.NameExtension?.some(n => n.toLowerCase() === norm)) {
        return d.DistrictID;
      }
    }
    return null;
  };

  const findWardCode = (name: string, districtId: number): string | null => {
    const norm = name.trim().toLowerCase();
    for (const w of wards) {
      if (w.DistrictID !== districtId) continue;
      if (w.WardName.toLowerCase() === norm || w.NameExtension?.some(n => n.toLowerCase() === norm)) {
        return w.WardCode;
      }
    }
    return null;
  };

  return {
    provinces,
    districts,
    wards,
    fetchDistricts,
    fetchWards,
    findProvinceId,
    findDistrictId,
    findWardCode
  };
}