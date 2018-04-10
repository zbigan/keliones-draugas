<?php

namespace App\Controller;


use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use App\Repository\CoordinateRepository;
use Symfony\Component\HttpFoundation\JsonResponse;

class CoordinateController extends Controller
{
     /**
     * @Route("/coordinate")
      */
     public function showCoordinateAction(CoordinateRepository $repository)
     {
        $coordArray = array();
        foreach ($repository->findAll() as $coordinate) {
            $tempArray = array(
                'name' => $coordinate->getName(),
                'address' => $coordinate->getAddress(),
                'latitude' => $coordinate->getLatitude(),
                'longitude' => $coordinate->getLongitude(),
                );
            $coordArray[] = $tempArray;
        }
        return new JsonResponse($coordArray); 	
    }

}