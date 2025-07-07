import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [todosLosNombres, setTodosLosNombres] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);

  // Cargar nombres de todos los Pokémon para sugerencias
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=10000')
      .then(res => res.json())
      .then(data => {
        const nombres = data.results.map(p => p.name);
        setTodosLosNombres(nombres);
      });
  }, []);

  // Cargar 4 Pokémon aleatorios al inicio
  useEffect(() => {
    fetchPokemonesAleatorios();
  }, []);

  const fetchPokemonesAleatorios = async () => {
    try {
      setCargando(true);
      setError(null);
      const fetchedPokemones = [];
      const pokemonIds = new Set();

      while (pokemonIds.size < 4) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        pokemonIds.add(randomId);
      }

      const idsArray = Array.from(pokemonIds);

      for (const id of idsArray) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        if (!response.ok) {
          throw new Error(`Error al cargar el Pokémon con ID ${id}`);
        }
        const data = await response.json();
        fetchedPokemones.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(typeInfo => typeInfo.type.name),
        });
      }
      setPokemones(fetchedPokemones);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const buscarPokemonPorNombre = async (nombre) => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
      if (!response.ok) throw new Error("Pokémon no encontrado");

      const data = await response.json();
      setPokemones([{
        id: data.id,
        nombre: data.name,
        imagen: data.sprites.front_default,
        tipos: data.types.map(t => t.type.name)
      }]);
    } catch (err) {
      setError(err.message);
      setPokemones([]);
    } finally {
      setCargando(false);
    }
  };

  const buscarPokemon = (e) => {
    e.preventDefault();

    if (busqueda.trim() === '') {
      fetchPokemonesAleatorios();
    } else {
      buscarPokemonPorNombre(busqueda.toLowerCase());
    }
  };

  return (
    <div className="pokemon-container">
      <form onSubmit={buscarPokemon} className="search-form">
        <input
          type="text"
          placeholder="Buscar por nombre (ej: pika)"
          value={busqueda}
          onChange={(e) => {
            const texto = e.target.value.toLowerCase();
            setBusqueda(texto);
            const sugeridos = todosLosNombres
              .filter(n => n.includes(texto))
              .slice(0, 5);
            setSugerencias(sugeridos);
          }}
        />
        <button type="submit">Buscar</button>
      </form>
  <video
    autoPlay
    muted
    loop
    playsInline
    className="video-fondo"
  >
    <source src="/wp-pokeball.mp4" type="video/mp4" />
    Tu navegador no soporta video HTML5.
  </video>

      {busqueda && sugerencias.length > 0 && (
        <ul className="sugerencias">
          {sugerencias.map(nombre => (
            <li key={nombre} onClick={() => {
              setBusqueda(nombre);
              setSugerencias([]);
              buscarPokemonPorNombre(nombre);
            }}>
              {nombre}
            </li>
          ))}
        </ul>
      )}

      {cargando && <div>Cargando Pokémon...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!cargando && !error && (
        <>
          <h2>{busqueda ? `Resultado de búsqueda` : `Tus 4 Pokémon Aleatorios`}</h2>
          <div className="pokemon-list">
            {pokemones.map(pokemon => (
              <div key={pokemon.id} className="pokemon-card">
                <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
                <img src={pokemon.imagen} alt={pokemon.nombre} />
                <p>
                  <strong>Tipos:</strong> {pokemon.tipos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonFetcher;

