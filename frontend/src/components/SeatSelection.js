import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, User, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const SeatSelection = ({ flightId, passengerCount = 1, onSeatSelect, onBack }) => {
  const [seatMap, setSeatMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectingLoading, setSelectingLoading] = useState(false);

  useEffect(() => {
    fetchSeatMap();
  }, [flightId]);

  const fetchSeatMap = async () => {
    try {
      const response = await axios.get(`${API}/flights/${flightId}/seats`);
      setSeatMap(response.data);
    } catch (error) {
      toast.error('Failed to load seat map');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    if (!seat.is_available || seat.status === 'booked' || seat.status === 'held') return;

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.seat_number === seat.seat_number);
      if (isSelected) {
        return prev.filter(s => s.seat_number !== seat.seat_number);
      } else {
        if (prev.length >= passengerCount) {
          toast.error(`You can only select ${passengerCount} seat(s)`);
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const getSeatColor = (seat) => {
    const isSelected = selectedSeats.find(s => s.seat_number === seat.seat_number);
    
    if (isSelected) return 'bg-primary text-white border-primary';
    if (!seat.is_available || seat.status === 'booked') return 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed';
    if (seat.status === 'held') return 'bg-yellow-200 dark:bg-yellow-900 text-yellow-700 cursor-not-allowed';
    if (seat.is_business) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 hover:bg-purple-200 border-purple-300';
    if (seat.is_extra_legroom) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 hover:bg-blue-200 border-blue-300';
    if (seat.is_exit_row) return 'bg-green-100 dark:bg-green-900/30 text-green-700 hover:bg-green-200 border-green-300';
    if (seat.is_window) return 'bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 border-teal-200';
    if (seat.is_aisle) return 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 border-amber-200';
    return 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200';
  };

  const handleConfirm = async () => {
    if (selectedSeats.length !== passengerCount) {
      toast.error(`Please select exactly ${passengerCount} seat(s)`);
      return;
    }

    setSelectingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/flights/${flightId}/seats/select`,
        {
          seats: selectedSeats.map(s => s.seat_number),
          passenger_count: passengerCount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSeatSelect({
        selection_id: response.data.selection_id,
        seats: response.data.seats,
        total_seat_price: response.data.total_seat_price
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to select seats');
    } finally {
      setSelectingLoading(false);
    }
  };

  const totalSeatPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  // Parse layout to get columns and aisle positions
  const getLayoutInfo = () => {
    if (!seatMap) return { columns: [], aisleAfter: [] };
    const layout = seatMap.layout || 'ABC_DEF';
    const sections = layout.split('_');
    const columns = sections.join('').split('');
    const aisleAfter = [];
    let pos = 0;
    sections.forEach((section, idx) => {
      pos += section.length;
      if (idx < sections.length - 1) aisleAfter.push(pos - 1);
    });
    return { columns, aisleAfter };
  };

  const { columns, aisleAfter } = getLayoutInfo();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!seatMap) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Seat map not available</p>
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = {};
  seatMap.seats.forEach(seat => {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    seatsByRow[seat.row].push(seat);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif">Select Your Seat</h2>
          <p className="text-sm text-muted-foreground">
            Select {passengerCount} seat{passengerCount > 1 ? 's' : ''} for your journey
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Flight Details
          </Button>
        )}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white border border-gray-200" />
              <span className="text-xs">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary" />
              <span className="text-xs">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-300" />
              <span className="text-xs">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-100 border border-purple-300" />
              <span className="text-xs">Business (+$150)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-100 border border-blue-300" />
              <span className="text-xs">Extra Legroom (+$50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100 border border-green-300" />
              <span className="text-xs">Exit Row (+$40)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-teal-50 border border-teal-200" />
              <span className="text-xs">Window (+$15)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-50 border border-amber-200" />
              <span className="text-xs">Aisle (+$10)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="text-center border-b pb-4">
              <div className="w-24 h-8 mx-auto bg-muted rounded-t-full flex items-center justify-center text-xs font-medium">
                Front
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-x-auto">
              <div className="min-w-[300px]">
                {/* Column Headers */}
                <div className="flex justify-center gap-1 mb-4">
                  <div className="w-8" /> {/* Row number placeholder */}
                  {columns.map((col, idx) => (
                    <div key={col} className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold text-sm">
                        {col}
                      </div>
                      {aisleAfter.includes(idx) && <div className="w-4 sm:w-6" />}
                    </div>
                  ))}
                </div>

                {/* Seat Rows */}
                <div className="space-y-1">
                  {Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b)).map(row => (
                    <div key={row} className="flex justify-center gap-1 items-center">
                      <div className="w-8 text-center text-xs font-medium text-muted-foreground">
                        {row}
                      </div>
                      {columns.map((col, idx) => {
                        const seat = seatsByRow[row].find(s => s.column === col);
                        return (
                          <div key={`${row}${col}`} className="flex items-center">
                            {seat ? (
                              <button
                                onClick={() => toggleSeat(seat)}
                                disabled={!seat.is_available || seat.status === 'booked' || seat.status === 'held'}
                                className={`
                                  w-8 h-8 sm:w-10 sm:h-10 rounded border text-xs font-medium
                                  transition-all duration-200 flex items-center justify-center
                                  ${getSeatColor(seat)}
                                  ${seat.is_available && seat.status !== 'booked' && seat.status !== 'held' ? 'cursor-pointer' : ''}
                                `}
                              >
                                {selectedSeats.find(s => s.seat_number === seat.seat_number) ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : seat.status === 'booked' ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  seat.seat_number
                                )}
                              </button>
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10" />
                            )}
                            {aisleAfter.includes(idx) && <div className="w-4 sm:w-6" />}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selection Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Your Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Passengers</span>
                <span className="font-medium">{passengerCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Selected</span>
                <span className="font-medium">{selectedSeats.length} / {passengerCount}</span>
              </div>

              {/* Selected Seats List */}
              {selectedSeats.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  {selectedSeats.map((seat, idx) => (
                    <div key={seat.seat_number} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Passenger {idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{seat.seat_number}</Badge>
                        {seat.price > 0 && (
                          <span className="text-sm font-medium text-primary">+${seat.price}</span>
                        )}
                        <button
                          onClick={() => toggleSeat(seat)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Seat Selection Total</span>
                  <span className="text-xl font-bold text-primary">${totalSeatPrice}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Added to your booking total
                </p>
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full mt-4"
                size="lg"
                disabled={selectedSeats.length !== passengerCount || selectingLoading}
                onClick={handleConfirm}
              >
                {selectingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Selecting...
                  </>
                ) : (
                  <>
                    Confirm Seat Selection
                  </>
                )}
              </Button>

              {selectedSeats.length !== passengerCount && (
                <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                  Select {passengerCount - selectedSeats.length} more seat{passengerCount - selectedSeats.length > 1 ? 's' : ''}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
