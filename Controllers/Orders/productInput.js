const toPaise = (rupees) => Math.round(Number(rupees) * 100);

const cleanProductInput = (body, { partial = false } = {}) => {
  const data = {};

  if (!partial || body.name !== undefined) data.name = typeof body.name === "string" ? body.name.trim() : body.name;
  if (!partial || body.description !== undefined) data.description = body.description?.trim?.() || "";
  if (!partial || body.category !== undefined) data.category = body.category;

  if (!partial || body.weatherTags !== undefined) {
    data.weatherTags = Array.isArray(body.weatherTags) ? [...new Set(body.weatherTags)] : [];
  }

  if (!partial || body.images !== undefined) {
    data.images = Array.isArray(body.images)
      ? body.images.map((u) => String(u).trim()).filter((u) => /^https?:\/\//i.test(u)).slice(0, 5)
      : [];
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    data.pricePaise = Number.isFinite(price) ? toPaise(price) : undefined;
  }

  if (!partial || body.variants !== undefined) {
    data.variants = Array.isArray(body.variants)
      ? body.variants
          .filter((v) => v && String(v.size || "").trim())
          .map((v) => ({ size: String(v.size).trim(), stock: Math.max(0, Math.floor(Number(v.stock) || 0)) }))
      : [];
  }

  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  return data;
};

module.exports = { cleanProductInput, toPaise };