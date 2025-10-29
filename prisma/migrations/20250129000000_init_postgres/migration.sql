
-- CreateTable
CREATE TABLE "Shipment" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'IN_TRANSIT',
  "eta" TIMESTAMP(3),
  "originLat" DOUBLE PRECISION,
  "originLng" DOUBLE PRECISION,
  "destLat" DOUBLE PRECISION,
  "destLng" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Function to auto-update updatedAt
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipment_set_updated_at
BEFORE UPDATE ON "Shipment"
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
