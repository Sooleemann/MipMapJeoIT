﻿using ProjNet.CoordinateSystems.Transformations;

namespace MipMap
{
    sealed class MTF : NetTopologySuite.Geometries.ICoordinateSequenceFilter
    {
        private readonly MathTransform _mathTransform;

        public MTF(MathTransform mathTransform) => _mathTransform = mathTransform;

        public bool Done => false;
        public bool GeometryChanged => true;
        public void Filter(NetTopologySuite.Geometries.CoordinateSequence seq, int i)
        {
            double x = seq.GetX(i);
            double y = seq.GetY(i);
            double z = seq.GetZ(i);
            _mathTransform.Transform(ref x, ref y, ref z);
            seq.SetX(i, x);
            seq.SetY(i, y);
            seq.SetZ(i, z);
        }
    }

}
