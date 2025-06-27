import { useState, useMemo } from "react";
import { useAudio, AudioRecording } from "../contexts/AudioContext";
import {
  Play,
  Pause,
  Trash2,
  Calendar,
  Clock,
  Video,
  FileAudio,
  Search,
  Filter,
  Grid3X3,
  List,
  Columns,
  SortAsc,
  SortDesc,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type ViewMode = "list" | "grid" | "columns";
type SortBy = "date" | "name" | "duration";
type SortOrder = "asc" | "desc";
type FilterBy = "all" | "audio" | "video" | "toxic" | "clean" | "unanalyzed";

export function AudioGallery() {
  const { state, dispatch } = useAudio();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileTypeIcon = (name: string) => {
    if (
      name.includes("extracted audio") ||
      name.includes(".mp4") ||
      name.includes(".avi") ||
      name.includes(".mov")
    ) {
      return <Video size={16} className="text-purple-600" />;
    }
    return <FileAudio size={16} className="text-blue-600" />;
  };

  const getResultIcon = (recording: AudioRecording) => {
    if (!recording.results) return null;
    return recording.results.isToxic ? (
      <AlertTriangle size={14} className="text-red-500" />
    ) : (
      <CheckCircle size={14} className="text-green-500" />
    );
  };

  const filteredAndSortedRecordings = useMemo(() => {
    let filtered = state.recordings.filter((recording) => {
      // Search filter
      if (
        searchQuery &&
        !recording.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      switch (filterBy) {
        case "audio":
          return !recording.name.includes("extracted audio");
        case "video":
          return recording.name.includes("extracted audio");
        case "toxic":
          return recording.results?.isToxic === true;
        case "clean":
          return recording.results?.isToxic === false;
        case "unanalyzed":
          return !recording.results;
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "date":
        default:
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [state.recordings, searchQuery, filterBy, sortBy, sortOrder]);

  const handlePlay = (recording: AudioRecording) => {
    if (playingId === recording.id) {
      setPlayingId(null);
    } else {
      setPlayingId(recording.id);
      dispatch({ type: "SELECT_RECORDING", payload: recording });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this recording?")) {
      dispatch({ type: "DELETE_RECORDING", payload: id });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getFilterCount = (filter: FilterBy) => {
    switch (filter) {
      case "audio":
        return state.recordings.filter(
          (r) => !r.name.includes("extracted audio")
        ).length;
      case "video":
        return state.recordings.filter((r) =>
          r.name.includes("extracted audio")
        ).length;
      case "toxic":
        return state.recordings.filter((r) => r.results?.isToxic === true)
          .length;
      case "clean":
        return state.recordings.filter((r) => r.results?.isToxic === false)
          .length;
      case "unanalyzed":
        return state.recordings.filter((r) => !r.results).length;
      default:
        return state.recordings.length;
    }
  };

  const renderRecordingCard = (
    recording: AudioRecording,
    isCompact = false
  ) => (
    <div
      key={recording.id}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        state.currentRecording?.id === recording.id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      } ${isCompact ? "p-3" : ""}`}
      onClick={() => dispatch({ type: "SELECT_RECORDING", payload: recording })}
    >
      <div className={`flex items-center gap-4 ${isCompact ? "gap-3" : ""}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay(recording);
          }}
          className={`p-3 rounded-full transition-all ${
            playingId === recording.id
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          } ${isCompact ? "p-2" : ""}`}
        >
          {playingId === recording.id ? (
            <Pause size={isCompact ? 14 : 16} />
          ) : (
            <Play size={isCompact ? 14 : 16} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getFileTypeIcon(recording.name)}
            {getResultIcon(recording)}
            <h3
              className={`font-semibold text-gray-900 truncate ${
                isCompact ? "text-sm" : ""
              }`}
            >
              {recording.name}
            </h3>
          </div>

          <div
            className={`flex items-center gap-4 mt-1 text-gray-600 ${
              isCompact ? "text-xs gap-3" : "text-sm"
            }`}
          >
            <div className="flex items-center gap-1">
              <Clock size={isCompact ? 12 : 14} />
              <span>
                {Math.floor(recording.duration / 60)}:
                {(recording.duration % 60).toFixed(0).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={isCompact ? 12 : 14} />
              <span>{formatDate(recording.timestamp)}</span>
            </div>
          </div>

          {recording.results && (
            <div className="mt-2 space-y-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                  isCompact ? "text-xs px-2 py-0.5" : "text-xs"
                } ${
                  recording.results.isToxic
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {recording.results.isToxic ? "Toxic" : "Clean"} (
                {(recording.results.confidence > 1
                  ? recording.results.confidence
                  : recording.results.confidence * 100
                ).toFixed(2)}
                %)
              </span>

              <div className="text-xs text-gray-500 italic">
                Model:{" "}
                {recording.results.model === "asr-text"
                  ? "ASR + Text Classification"
                  : "End-to-End Audio"}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(recording.id);
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        >
          <Trash2 size={isCompact ? 14 : 16} />
        </button>
      </div>

      {playingId === recording.id && (
        <div className="mt-4">
          <audio
            autoPlay
            controls
            className="w-full"
            src={recording.url}
            onEnded={() => setPlayingId(null)}
          />
        </div>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedRecordings.map((recording) =>
        renderRecordingCard(recording, true)
      )}
    </div>
  );

  const renderColumnsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredAndSortedRecordings.map((recording) =>
        renderRecordingCard(recording)
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredAndSortedRecordings.map((recording) =>
        renderRecordingCard(recording)
      )}
    </div>
  );

  if (state.recordings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Audio Gallery</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">No recordings yet.</p>
          <p className="text-sm text-gray-400">
            Record audio, upload audio files, or upload videos to extract audio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Audio Gallery ({filteredAndSortedRecordings.length})
        </h2>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("columns")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "columns"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Columns View"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Grid View"
            >
              <Grid3X3 size={16} />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-all ${
              showFilters
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            title="Toggle Filters"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters and Sort */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Filter Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "audio", label: "Audio Files" },
                  { key: "video", label: "Video Files" },
                  { key: "toxic", label: "Toxic" },
                  { key: "clean", label: "Clean" },
                  { key: "unanalyzed", label: "Unanalyzed" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilterBy(key as FilterBy)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filterBy === key
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {label} ({getFilterCount(key as FilterBy)})
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order:
                </label>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc size={16} />
                  ) : (
                    <SortDesc size={16} />
                  )}
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredAndSortedRecordings.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500">
            No recordings match your search criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterBy("all");
            }}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {viewMode === "list" && renderListView()}
          {viewMode === "columns" && renderColumnsView()}
          {viewMode === "grid" && renderGridView()}
        </>
      )}
    </div>
  );
}
