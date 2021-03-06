<?php

namespace App\Controller;

use App\Entity\Coordinate;
use App\Form\CoordinateType;
use App\Repository\CoordinateRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Pagerfanta\Adapter\DoctrineORMAdapter;
use Pagerfanta\Pagerfanta;

/**
 * @Route("/coordinate")
 */
class CoordinateController extends Controller
{
    /**
     * @Route("/", name="coordinate_index")
     * @Method("GET")
     */
    public function index(Request $request, CoordinateRepository $coordinateRepository): Response
    {
        $adapter = new DoctrineORMAdapter($coordinateRepository->createQueryBuilder('c'));
        $pager = new Pagerfanta($adapter);
        $pager->setCurrentPage($request->query->getInt('page', 1));

        return $this->render(
            'coordinate/index.html.twig',
            ['coordinates_pager' => $pager]
        );
    }

    /**
     * @Route("/new", name="coordinate_new")
     * @Method({"GET", "POST"})
     * @Security("has_role('ROLE_USER')")
     */
    public function new(Request $request): Response
    {
        $coordinate = new Coordinate($this->getUser());
        $form = $this->createForm(CoordinateType::class, $coordinate);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($coordinate);
            $em->flush();

            return $this->redirectToRoute('coordinate_show', ['id' => $coordinate->getId()]);
        }

        return $this->render('coordinate/new.html.twig', [
            'coordinate' => $coordinate,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="coordinate_show")
     * @Method("GET")
     */
    public function show(Coordinate $coordinate, Request $request): Response
    {
        if ($coordinate->getThread() === null) {
            $threadManager = $this->get('fos_comment.manager.thread');
            $thread = $threadManager->createThread();
            $thread->setId($coordinate->getId());
            $thread->setPermalink($request->getUri());

            // Add the thread
            $threadManager->saveThread($thread);
            $coordinate->setThread($thread);
            $this->get('doctrine.orm.default_entity_manager')->flush();
        }
        return $this->render('coordinate/show.html.twig', ['coordinate' => $coordinate]);
    }

    /**
     * @Route("/{id}/edit", name="coordinate_edit")
     * @Method({"GET", "POST"})
     * @Security("has_role('ROLE_USER')")
     */
    public function edit(Request $request, Coordinate $coordinate): Response
    {
        if (!$this->isGranted('ROLE_ADMIN', $this->getUser()) && $coordinate->getUser() !== $this->getUser()) {
            throw new AccessDeniedHttpException();
        }

        $form = $this->createForm(CoordinateType::class, $coordinate);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('coordinate_edit', ['id' => $coordinate->getId()]);
        }

        return $this->render('coordinate/edit.html.twig', [
            'coordinate' => $coordinate,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="coordinate_delete")
     * @Method("DELETE")
     * @Security("has_role('ROLE_USER')")
     */
    public function delete(Request $request, Coordinate $coordinate): Response
    {
        if (!$this->isGranted('ROLE_ADMIN', $this->getUser()) && $coordinate->getUser() !== $this->getUser()) {
            throw new AccessDeniedHttpException();
        }

        if ($this->isCsrfTokenValid('delete'.$coordinate->getId(), $request->request->get('_token'))) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($coordinate);
            $em->flush();
        }

        return $this->redirectToRoute('coordinate_index');
    }
}
